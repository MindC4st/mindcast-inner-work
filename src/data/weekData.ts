export interface WeekInfo {
  number: number;
  title: string;
  episode: string;
  focus: string;
}

export const WEEKS: WeekInfo[] = [
  {
    number: 1,
    title: "Uncovering Our Beliefs",
    episode: "Johann Hari — Everything You Think You Know About Meaning & Happiness Is Wrong (Diary of a CEO)",
    focus: "What do we actually believe about happiness, addiction, and connection — before we're told what to think?",
  },
  {
    number: 2,
    title: "What's Driving You?",
    episode: "Group choice — each member pitches one podcast episode related to Wired. Group votes. Winner plays.",
    focus: "Motivation, dopamine, what we're really chasing",
  },
  {
    number: 3,
    title: "The Machines We Live In",
    episode: "Facilitator recommendation — focus on attention, social media, junk values",
    focus: "What systems are shaping your behaviour without your permission?",
  },
  {
    number: 4,
    title: "Shame & Story",
    episode: "Group choice",
    focus: "The stories we tell about ourselves. Where did they come from?",
  },
  {
    number: 5,
    title: "Connection vs Isolation",
    episode: "Facilitator recommendation — loneliness, community, belonging",
    focus: "Where are you truly connected vs where are you performing connection?",
  },
  {
    number: 6,
    title: "Habit Architecture",
    episode: "Group choice",
    focus: "What you do every day is who you are. What does your architecture say about you?",
  },
  {
    number: 7,
    title: "The Identity Audit",
    episode: "Facilitator recommendation",
    focus: "Who are you without your job, your relationship, your phone?",
  },
  {
    number: 8,
    title: "Meaning Over Happiness",
    episode: "Group choice",
    focus: "Revisiting the Russian philosopher concept from Week 1 — has your answer changed?",
  },
  {
    number: 9,
    title: "Free Rec Week",
    episode: "Each member recommends their personal highlight from the term",
    focus: "What hit different? What do you want the group to remember?",
  },
  {
    number: 10,
    title: "The Return",
    episode: "Revisit Week 1 entry",
    focus: "Read back your Week 1 beliefs. What's changed? Full group reflection.",
  },
];

export const BELIEF_QUESTIONS = [
  "Happiness is something you can choose",
  "Addiction is a personal weakness",
  "Deep connection requires vulnerability",
  "Most people act in their own self-interest",
  "Meaning matters more than happiness",
];

export const REFLECTION_QUESTIONS = [
  "What surprised you most about this episode?",
  "What idea challenged something you previously believed?",
  "How does this topic relate to your life right now?",
  "What would you want to discuss with the group?",
  "What is one thing you want to remember from this week?",
];

export const DOMAINS = [
  "Connection",
  "Purpose",
  "Work",
  "Relationships",
  "Mental Wellbeing",
  "Screen Habits",
  "Financial Values",
  "Growth",
  "Authenticity",
];

export const SELF_AUDIT_QUESTIONS = [
  "What domain feels most alive for you right now?",
  "Where do you feel the most tension or resistance?",
  "What one thing would shift the most if it improved?",
];
