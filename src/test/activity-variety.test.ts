// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const base = read("supabase/migrations/20260711180000_activity_type.sql");
const library = read("supabase/migrations/20260817120000_interactive_activity_types.sql");
const whiteboard = read("supabase/migrations/20260820140001_intention_ladder_and_whiteboard.sql");
const tuning = read("supabase/migrations/20260830130000_activity_prompt_tuning.sql");
const liveView = read("src/pages/mindcast-live/FacilitatorView.tsx");

const currentSequence = () => {
  const types = Array.from({ length: 52 }, () => "reflection");
  for (const [, week, type] of base.matchAll(/\((\d+),'(wordcloud|poll|none)'\)/g)) {
    types[Number(week) - 1] = type;
  }
  for (let index = 0; index < types.length; index += 1) {
    if (types[index] === "poll") types[index] = "choice";
  }
  for (const [, week, type] of library.matchAll(/\((\d+),'(scale|phrase)'\)/g)) {
    const index = Number(week) - 1;
    if (types[index] === "reflection") types[index] = type;
  }
  if (/SET activity_type = 'whiteboard'[\s\S]*week_number = 1/.test(whiteboard)) {
    types[0] = "whiteboard";
  }
  expect(tuning).toMatch(/activity_type = 'wordcloud'[\s\S]*week_number = 4/);
  expect(tuning).toMatch(/activity_type = 'phrase'[\s\S]*week_number = 42/);
  types[3] = "wordcloud";
  types[41] = "phrase";
  return types;
};

describe("52-week live activity variety", () => {
  it("uses seven distinct interaction surfaces with no dominant textarea", () => {
    const counts = currentSequence().reduce<Record<string, number>>((all, type) => {
      all[type] = (all[type] || 0) + 1;
      return all;
    }, {});
    expect(counts).toEqual({
      reflection: 8,
      whiteboard: 1,
      scale: 12,
      choice: 10,
      phrase: 13,
      wordcloud: 6,
      none: 2,
    });
  });

  it("never repeats the same interaction in consecutive weeks", () => {
    const types = currentSequence();
    for (let index = 1; index < types.length; index += 1) {
      expect(types[index], `weeks ${index} and ${index + 1}`).not.toBe(types[index - 1]);
    }
  });

  it("broadcasts the merged activity and intention slides to member phones", () => {
    expect(liveView).toMatch(/currentKind === "deeper" \? "activity"/);
    expect(liveView).toMatch(/currentKind === "practice" \? "intention"/);
    expect(liveView).toMatch(/activity_options: currentKind === "deeper"/);
  });
});
