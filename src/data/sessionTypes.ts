export interface SessionSection {
  id: string;
  header: string;
  sub?: string;
  duration?: string;
  activities: SessionActivity[];
}

export type SessionActivity =
  | { type: "reflection"; key: string; prompt: string }
  | { type: "scale"; key: string; statement: string; minLabel: string; maxLabel: string }
  | { type: "multipleChoice"; key: string; question: string; options: string[]; multiSelect?: boolean }
  | { type: "connectPairs"; key: string; instruction: string; left: string[]; right: string[]; correct: [string, string][] }
  | { type: "dragDrop"; key: string; instruction: string; cards: string[]; columns: { id: string; label: string; correct: string[] }[] }
  | { type: "phraseBuilder"; key: string; template: string }
  | { type: "commitment"; key: string; stem: string }
  | { type: "iceberg"; key: string; aboveLabel: string; belowLabel: string; cards: string[] }
  | { type: "thermometer"; key: string; title?: string; thermometers: { key: string; defaultLabel: string; showNameInput?: boolean }[] }
  | { type: "previousCommitment"; key: string; sessionId: string; label: string }
  | { type: "seriesFinale"; key: string; lines: string[] };

export interface SessionData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  sessionNumber: string;
  sections: SessionSection[];
  series?: {
    title: string;
    sessions: { id: string; label: string; path: string }[];
  };
  nextSession?: { label: string; path: string };
}
