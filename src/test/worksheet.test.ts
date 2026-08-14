import { describe, expect, it } from "vitest";
import { generateWorksheetPdf } from "@/lib/generateWorksheetPdf";

const FULL = {
  week_number: 1,
  phase_name: "See Clearly",
  theme_title: "The Signal and the Noise",
  session_title: "What Are You Actually Receiving?",
  audience: "Adult",
  signal_metaphor:
    "Every broadcast has interference. Your life is no different. The signal is always there — underneath the static of urgency, comparison, distraction, and old programming. Mindcast LIVE is your practice of tuning in.",
  video_question_1:
    "What moment in the video showed someone naming the invisible load they carry — and what did naming it change for them?",
  video_question_2:
    "What is one invisible thing you carry right now that you could name to someone this week — and who would you name it to?",
  journaling_prompt:
    "What invisible load have you been carrying silently — and what would it take to name it, so it could finally be seen and shared?",
  experiential_exercise:
    "MAKE THE INVISIBLE VISIBLE: For one week, track everything you carry — seen and unseen. Two columns: 'Visible tasks' (dishes, laundry, bills) and 'Invisible load' (remembering, planning, anticipating, following up). Be specific. Then compare your list with the person beside you. What's on your list that they'd never notice? What would happen if you stopped carrying one item silently? Share one thing from the 'invisible' column that surprised you.",
  weekly_practice_mon:
    "Catch the hum. Once today, notice the mental list running in the background and write down one invisible thing you're carrying that no one else can see.",
  weekly_practice_wed:
    "Make one thing visible. Name one invisible responsibility out loud to the person who shares your life — not as a complaint, as information: 'I carry this. I'd like us to see it together.'",
  weekly_practice_sun:
    "Move from helping to owning. Identify one task you've been 'helping with' that you could own — and one task you're carrying that someone else could own. Take one concrete step toward real ownership.",
};

describe("worksheet PDF", () => {
  it("fits the full Week 1 sheet (incl. video questions) on one A4 page", () => {
    expect(generateWorksheetPdf(FULL).getNumberOfPages()).toBe(1);
  });

  it("fits a sparse session on one page", () => {
    expect(generateWorksheetPdf({ week_number: 3, theme_title: "Test", audience: "Child" }).getNumberOfPages()).toBe(1);
  });

  it("fits long video questions plus a long activity on one page", () => {
    const long = {
      ...FULL,
      video_question_1: "Q ".repeat(60),
      video_question_2: "Q ".repeat(60),
      experiential_exercise: "E ".repeat(200),
    };
    expect(generateWorksheetPdf(long).getNumberOfPages()).toBe(1);
  });
});
