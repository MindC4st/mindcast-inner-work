import { describe, it, expect } from "vitest";
import { groupFoyerArrivals, type FoyerPerson } from "@/lib/foyerArrivals";

const person = (over: Partial<FoyerPerson> & { profileId: string }): FoyerPerson => ({
  householdId: null,
  isMinor: false,
  isPayer: false,
  fullName: "Member",
  firstName: "Member",
  lastName: null,
  checkedInAt: "2026-08-23T09:00:00.000Z",
  ...over,
});

describe("foyer arrivals — safeguarding-first grouping", () => {
  it("1. no arrivals -> no labels (room-ready state)", () => {
    expect(groupFoyerArrivals([])).toEqual([]);
  });

  it("2. one visible adult -> individual full name", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
    ]);
    expect(labels).toHaveLength(1);
    expect(labels[0].displayLabel).toBe("MATT CARLSON");
    expect(labels[0].arrivalType).toBe("individual");
  });

  it("3. two visible adults same household -> THE X FAMILY", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
      person({ profileId: "b", householdId: "h1", fullName: "Ash Carlson", firstName: "Ash", lastName: "Carlson", checkedInAt: "2026-08-23T09:01:00.000Z" }),
    ]);
    expect(labels).toHaveLength(1);
    expect(labels[0].displayLabel).toBe("THE CARLSON FAMILY");
    expect(labels[0].arrivalType).toBe("family");
  });

  it("4. adult + teen same household -> THE X FAMILY", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
      person({ profileId: "t", householdId: "h1", isMinor: true, fullName: "Leo Carlson", firstName: "Leo", lastName: null }),
    ]);
    expect(labels.map((l) => l.displayLabel)).toEqual(["THE CARLSON FAMILY"]);
  });

  it("5. adult + child same household -> THE X FAMILY", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Sarah Thompson", firstName: "Sarah", lastName: "Thompson" }),
      person({ profileId: "c", householdId: "h1", isMinor: true, fullName: "Ruby", firstName: "Ruby", lastName: null }),
    ]);
    expect(labels.map((l) => l.displayLabel)).toEqual(["THE THOMPSON FAMILY"]);
  });

  it("6. two different households -> two separate foyer labels", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
      person({ profileId: "b", householdId: "h1", fullName: "Ash Carlson", firstName: "Ash", lastName: "Carlson" }),
      person({ profileId: "c", fullName: "Sarah Thompson", firstName: "Sarah", lastName: "Thompson" }),
    ]);
    const set = labels.map((l) => l.displayLabel).sort();
    expect(set).toEqual(["SARAH THOMPSON", "THE CARLSON FAMILY"].sort());
  });

  it("7. a hidden minor never contributes to grouping", () => {
    // The RPC only receives visible check-ins (wall_hidden=false). A hidden
    // minor is simply absent from the input — the adult must NOT become a
    // family label, because that would reveal another member is present.
    const visibleOnly = [
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
      // the hidden minor is deliberately not here
    ];
    const labels = groupFoyerArrivals(visibleOnly);
    expect(labels).toHaveLength(1);
    expect(labels[0].displayLabel).toBe("MATT CARLSON");
    expect(labels[0].arrivalType).toBe("individual");
  });

  it("8. an individual minor uses safe first-name-only display", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "t", isMinor: true, fullName: "Leo Carlson", firstName: "Leo", lastName: null }),
    ]);
    expect(labels[0].displayLabel).toBe("LEO");
    expect(labels[0].displayLabel).not.toContain("CARLSON");
  });

  it("9. repeated check-ins do not duplicate the household", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson", checkedInAt: "2026-08-23T09:30:00.000Z" }),
      person({ profileId: "b", householdId: "h1", fullName: "Ash Carlson", firstName: "Ash", lastName: "Carlson", checkedInAt: "2026-08-23T09:05:00.000Z" }),
    ]);
    expect(labels).toHaveLength(1);
    expect(labels[0].displayLabel).toBe("THE CARLSON FAMILY");
    expect(labels[0].latestCheckedInAt).toBe("2026-08-23T09:30:00.000Z");
  });

  it("10. a new arrival updates the foyer on recompute (realtime path)", () => {
    const first = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
    ]);
    expect(first[0].displayLabel).toBe("MATT CARLSON");
    const second = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "Matt Carlson", firstName: "Matt", lastName: "Carlson" }),
      person({ profileId: "b", householdId: "h1", fullName: "Ash Carlson", firstName: "Ash", lastName: "Carlson", checkedInAt: "2026-08-23T09:02:00.000Z" }),
    ]);
    expect(second).toHaveLength(1);
    expect(second[0].displayLabel).toBe("THE CARLSON FAMILY");
  });

  it("surname never comes from a child's name", () => {
    const labels = groupFoyerArrivals([
      // Two minors, no adult: no family label can be manufactured.
      person({ profileId: "c1", householdId: "h1", isMinor: true, fullName: "Ruby Smith", firstName: "Ruby", lastName: null }),
      person({ profileId: "c2", householdId: "h1", isMinor: true, fullName: "Koa Smith", firstName: "Koa", lastName: null, checkedInAt: "2026-08-23T09:01:00.000Z" }),
    ]);
    expect(labels.map((l) => l.displayLabel).sort()).toEqual(["KOA", "RUBY"]);
    expect(labels.every((l) => l.arrivalType === "individual")).toBe(true);
  });

  it("no reliable surname -> first visible adult's display name, still one label", () => {
    const labels = groupFoyerArrivals([
      person({ profileId: "a", householdId: "h1", isPayer: true, fullName: "River", firstName: "River", lastName: "" }),
      person({ profileId: "b", householdId: "h1", fullName: "Sage", firstName: "Sage", lastName: "", checkedInAt: "2026-08-23T09:01:00.000Z" }),
    ]);
    expect(labels).toHaveLength(1);
    expect(labels[0].displayLabel).toBe("RIVER");
    expect(labels[0].arrivalType).toBe("family");
  });
});
