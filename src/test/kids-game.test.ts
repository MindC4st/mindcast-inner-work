import { describe, expect, it } from "vitest";
import { splitKidsGame } from "@/lib/kidsGame";

describe("child closing-game copy", () => {
  it("separates an uppercase game title from its instructions", () => {
    expect(splitKidsGame("SIGNAL IN THE STATIC. Make gentle noise, then listen for the timer.")).toEqual({
      title: "SIGNAL IN THE STATIC",
      instructions: "Make gentle noise, then listen for the timer.",
    });
  });

  it("supports title-case games separated with an em dash", () => {
    expect(splitKidsGame("Rescue the Treasures — Carry three objects across the river.")).toEqual({
      title: "Rescue the Treasures",
      instructions: "Carry three objects across the river.",
    });
  });

  it("keeps unstructured safeguarded instructions intact", () => {
    const result = splitKidsGame("Move around the room and freeze when the music stops");
    expect(result.title).toBe("The Closing Game / Activity");
    expect(result.instructions).toContain("freeze");
  });
});
