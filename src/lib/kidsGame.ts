export type KidsGameParts = {
  title: string;
  instructions: string;
};

/**
 * The curriculum stores the child game as one safeguarded text field. Most
 * lessons begin that field with a short game name followed by a full stop or
 * an em dash. Split that display convention without making the database carry
 * a second, potentially drifting copy of the title.
 */
export const splitKidsGame = (value?: string | null): KidsGameParts => {
  const clean = (value || "").replace(/\*\*/g, "").trim();
  if (!clean) {
    return {
      title: "The Closing Game / Activity",
      instructions: "Choose the closing activity prepared for this lesson.",
    };
  }

  const firstLineBreak = clean.indexOf("\n");
  if (firstLineBreak > 2 && firstLineBreak <= 90) {
    return {
      title: clean.slice(0, firstLineBreak).trim(),
      instructions: clean.slice(firstLineBreak + 1).trim(),
    };
  }

  const sentence = clean.match(/^([^.!?\n]{3,90})[.!?]\s+([\s\S]+)$/);
  if (sentence) {
    return { title: sentence[1].trim(), instructions: sentence[2].trim() };
  }

  const dash = clean.match(/^([^—\n]{3,70})\s+—\s+([\s\S]+)$/);
  if (dash) {
    return { title: dash[1].trim(), instructions: dash[2].trim() };
  }

  return { title: "The Closing Game / Activity", instructions: clean };
};
