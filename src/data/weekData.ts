export interface Bookmark {
  id: string;
  timestamp: number; // seconds into the video/audio
  label: string;
  question: string;
}

export interface WeekInfo {
  number: number;
  title: string;
  episode: string;
  focus: string;
  youtubeId?: string; // YouTube video ID for embedding
  bookmarks: Bookmark[];
}

export const WEEKS: WeekInfo[] = [
  {
    number: 1,
    title: "Uncovering Our Beliefs",
    episode: "Johann Hari — Everything You Think You Know About Meaning & Happiness Is Wrong (Diary of a CEO)",
    focus: "What do we actually believe about happiness, addiction, and connection — before we're told what to think?",
    youtubeId: "dQw4w9WgXcQ", // Placeholder — replace with real episode
    bookmarks: [
      { id: "w1_b1", timestamp: 300, label: "Lost Connections", question: "Hari says depression isn't a chemical imbalance — it's a signal. What's your gut reaction to that?" },
      { id: "w1_b2", timestamp: 720, label: "Junk Values", question: "Think about what you spent money on this week. How much was for connection vs. comfort?" },
      { id: "w1_b3", timestamp: 1080, label: "Nine Causes", question: "Which of Hari's nine causes of disconnection do you feel most in your own life right now?" },
      { id: "w1_b4", timestamp: 1500, label: "Meaning vs Happiness", question: "If you had to choose: a meaningful life or a happy one — which would you pick and why?" },
    ],
  },
  {
    number: 2,
    title: "What's Driving You?",
    episode: "Group choice — each member pitches one podcast episode related to Wired. Group votes. Winner plays.",
    focus: "Motivation, dopamine, what we're really chasing",
    bookmarks: [
      { id: "w2_b1", timestamp: 300, label: "Dopamine Hit", question: "What's the last thing you did purely for the dopamine hit? How did you feel 10 minutes after?" },
      { id: "w2_b2", timestamp: 600, label: "Motivation Source", question: "Is your current main motivation intrinsic or extrinsic? How do you know?" },
      { id: "w2_b3", timestamp: 1000, label: "The Chase", question: "What are you chasing right now that you think will make you feel complete? Will it?" },
    ],
  },
  {
    number: 3,
    title: "The Machines We Live In",
    episode: "Facilitator recommendation — focus on attention, social media, junk values",
    focus: "What systems are shaping your behaviour without your permission?",
    bookmarks: [
      { id: "w3_b1", timestamp: 300, label: "Screen Time", question: "Without checking — how much screen time do you think you had yesterday? Now check. Were you close?" },
      { id: "w3_b2", timestamp: 700, label: "Attention Economy", question: "Name one app or platform that you know manipulates your attention. Why do you still use it?" },
      { id: "w3_b3", timestamp: 1100, label: "Permission", question: "What behaviour do you engage in daily that you never consciously chose?" },
    ],
  },
  {
    number: 4,
    title: "Shame & Story",
    episode: "Group choice",
    focus: "The stories we tell about ourselves. Where did they come from?",
    bookmarks: [
      { id: "w4_b1", timestamp: 300, label: "Origin Story", question: "What's one story about yourself that you've been telling since childhood? Is it still true?" },
      { id: "w4_b2", timestamp: 700, label: "Shame vs Guilt", question: "Think of something you feel ashamed of. Is it shame (I am bad) or guilt (I did something bad)?" },
      { id: "w4_b3", timestamp: 1100, label: "Rewrite", question: "If you could rewrite one narrative about yourself, what would the new version say?" },
    ],
  },
  {
    number: 5,
    title: "Connection vs Isolation",
    episode: "Facilitator recommendation — loneliness, community, belonging",
    focus: "Where are you truly connected vs where are you performing connection?",
    bookmarks: [
      { id: "w5_b1", timestamp: 300, label: "Loneliness", question: "When was the last time you felt genuinely lonely — even if you were surrounded by people?" },
      { id: "w5_b2", timestamp: 700, label: "True Connection", question: "Name one relationship where you feel fully seen. What makes it different?" },
      { id: "w5_b3", timestamp: 1100, label: "Performance", question: "Where in your life are you performing connection rather than experiencing it?" },
    ],
  },
  {
    number: 6,
    title: "Habit Architecture",
    episode: "Group choice",
    focus: "What you do every day is who you are. What does your architecture say about you?",
    bookmarks: [
      { id: "w6_b1", timestamp: 300, label: "Morning Audit", question: "Walk through the first 60 minutes of your day. What does that ritual say about your priorities?" },
      { id: "w6_b2", timestamp: 700, label: "Invisible Habits", question: "What habit do you have that you've never consciously chosen but do every single day?" },
      { id: "w6_b3", timestamp: 1100, label: "Architecture", question: "If you redesigned your environment to support one goal, what would you physically change?" },
    ],
  },
  {
    number: 7,
    title: "The Identity Audit",
    episode: "Facilitator recommendation",
    focus: "Who are you without your job, your relationship, your phone?",
    bookmarks: [
      { id: "w7_b1", timestamp: 300, label: "Strip Away", question: "If you lost your job tomorrow, how would you introduce yourself?" },
      { id: "w7_b2", timestamp: 700, label: "Core Identity", question: "What three words describe who you are — not what you do?" },
      { id: "w7_b3", timestamp: 1100, label: "Without", question: "What would you miss most if your phone didn't exist for a week? What does that reveal?" },
    ],
  },
  {
    number: 8,
    title: "Meaning Over Happiness",
    episode: "Group choice",
    focus: "Revisiting the Russian philosopher concept from Week 1 — has your answer changed?",
    bookmarks: [
      { id: "w8_b1", timestamp: 300, label: "Revisit", question: "In Week 1 you chose between meaning and happiness. Has your answer changed? Why?" },
      { id: "w8_b2", timestamp: 700, label: "Suffering", question: "Is there a suffering in your life that has given you meaning? What is it?" },
      { id: "w8_b3", timestamp: 1100, label: "Legacy", question: "If this week was your last, what would you want people to remember about how you lived?" },
    ],
  },
  {
    number: 9,
    title: "Free Rec Week",
    episode: "Each member recommends their personal highlight from the term",
    focus: "What hit different? What do you want the group to remember?",
    bookmarks: [
      { id: "w9_b1", timestamp: 300, label: "Highlight", question: "Which episode from this term changed the way you think about something? Why?" },
      { id: "w9_b2", timestamp: 700, label: "Ripple Effect", question: "Has anything from Mindcast changed how you act in your daily life? Give a specific example." },
      { id: "w9_b3", timestamp: 1100, label: "Pass It On", question: "If you could share one insight from this term with someone you love, what would it be?" },
    ],
  },
  {
    number: 10,
    title: "The Return",
    episode: "Revisit Week 1 entry",
    focus: "Read back your Week 1 beliefs. What's changed? Full group reflection.",
    bookmarks: [
      { id: "w10_b1", timestamp: 300, label: "Week 1 Mirror", question: "Read your Week 1 responses. What surprises you most about what you wrote?" },
      { id: "w10_b2", timestamp: 700, label: "Biggest Shift", question: "What is the single biggest shift in your thinking over these 10 weeks?" },
      { id: "w10_b3", timestamp: 1100, label: "What Stays", question: "What practice, idea, or commitment from this term will you carry forward? Why?" },
    ],
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
