import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  generateWorksheetPdf,
  type WorksheetSession,
} from "../src/lib/generateWorksheetPdf";

const outputDir = resolve(process.cwd(), "output", "pdf");
mkdirSync(outputDir, { recursive: true });

const base: WorksheetSession = {
  week_number: 1,
  phase_name: "See Clearly",
  theme_title: "The Signal and the Noise",
  session_title: "What Are You Actually Receiving?",
  audience: "Adult",
  opening_question: "What are you actually receiving right now - and what is asking for your attention?",
  previous_week_callback: "Notice one moment when the noise got loud, then look for the quieter signal underneath it.",
  ancient_wisdom_reframe: "Across many traditions, attention is treated as a practice: what we return to shapes what we can see and how we respond.",
  signal_metaphor: "Your mind is a phone with 47 tabs open and notifications firing - the signal is the one tab you opened on purpose. Close the tabs for one breath and hear the quiet channel underneath the noise.",
  video_description: "A short story about stress, attention and choosing what receives your energy.",
  video_question_1: "What idea from the speaker felt most useful or surprising?",
  video_question_2: "Where does noise make it harder to hear what matters in your own life?",
  core_concept: "Attention is not the same as control. The practice is to notice what is competing for attention, name the signal that matters, and make one deliberate choice.",
  thought_provoking_question: "What invisible load have you been carrying silently - and what would it take to name it?",
  experiential_exercise: "Make the invisible visible. List what you are carrying, seen and unseen. Sort it into what belongs to you, what can be shared, and what can be put down. Choose one small next action.",
  private_write_prompt: "What is one load you have not named out loud yet?",
  journaling_prompt: "What is the loudest noise in your head right now - and what quiet signal is it drowning out?",
  intention_prompt: "Choose one specific signal to follow this week. Make the action small enough to do even on a noisy day.",
  practice_sun_today: "Catch the hum. Notice the background noise and write down one signal you want to hear.",
  practice_midweek: "Make one thing visible. Name a responsibility, ask for information, or share the load.",
  practice_fri: "Move from helping to owning. Choose one concrete step toward real ownership.",
  closing_quote: "My attention is mine to direct. I can notice the noise and choose the signal.",
  closing_quote_attribution: "Mindcast Week 1",
};

const samples: WorksheetSession[] = [
  base,
  {
    ...base,
    audience: "Teen",
    session_title: "How to Make Stress Your Friend",
    opening_question: "What has been taking up the most space in your head this week?",
    signal_metaphor: "Your brain is like your phone with every app open and buzzing. The signal is the one thing that actually matters. Turn on Do Not Disturb for one minute and notice the quiet.",
    journaling_prompt: "Which notification in your life feels urgent but is not actually important?",
  },
  {
    ...base,
    audience: "Child",
    session_title: "The Colour Monster",
    last_week_theme: "We practised noticing what was loud and what was quiet.",
    kids_picture_book: "The Colour Monster",
    kids_picture_book_author: "Anna Llenas",
    kids_picture_book_question: "Which colour feels most like today, and why?",
    kids_signal_metaphor: "Feelings can be like colours mixed in a jar. We can look gently, name one colour, and ask a trusted grown-up for help when we need it.",
    kids_colouring_prompt: "Colour the feelings you can notice today. There is no right colour.",
    kids_game: "Signal statues: move while the room is noisy, freeze when the signal sounds, then name one thing you noticed.",
    kids_game_equipment: "A bell or gentle sound maker.",
    journaling_prompt: "What does your picture want to say?",
    intention_prompt: "One thing I want to practise this week is...",
    practice_sun_today: "Name one feeling colour with a trusted grown-up.",
    practice_midweek: "Pause and notice which colour is here now.",
    practice_fri: "Choose one safe action that helps with that feeling.",
    closing_quote: "I can notice my feelings, name one, and ask for help.",
  },
];

for (const session of samples) {
  const filename = `mindcast-week-01-${session.audience.toLowerCase()}-workbook.pdf`;
  const output = resolve(outputDir, filename);
  const bytes = Buffer.from(generateWorksheetPdf(session).output("arraybuffer"));
  writeFileSync(output, bytes);
  console.log(`${session.audience}: ${output}`);
}
