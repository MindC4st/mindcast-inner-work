import { SessionData } from "./sessionTypes";

const trustSeries = {
  title: "TRUST — A 3-PART SERIES",
  sessions: [
    { id: "trust-1", label: "S1: WHAT IS TRUST?", path: "/session/trust-1" },
    { id: "trust-2", label: "S2: HOW TRUST BREAKS", path: "/session/trust-2" },
    { id: "trust-3", label: "S3: REBUILDING TRUST", path: "/session/trust-3" },
  ],
};

export const trust1: SessionData = {
  id: "trust-1",
  title: "WHAT IS TRUST?",
  subtitle: "UNDERSTANDING THE FOUNDATION",
  duration: "90 MINUTES",
  sessionNumber: "SESSION 01 OF 03",
  series: trustSeries,
  nextSession: { label: "NEXT WEEK → SESSION 2: HOW TRUST BREAKS", path: "/session/trust-2" },
  sections: [
    {
      id: "arrive",
      header: "LAND HERE FIRST",
      sub: "Before we explore trust with others, we check in with ourselves.",
      duration: "5 MIN",
      activities: [
        { type: "scale", key: "arrive-self-trust", statement: "How much do I trust myself right now?", minLabel: "NOT AT ALL", maxLabel: "COMPLETELY" },
        { type: "scale", key: "arrive-open", statement: "How open do I feel to exploring this topic tonight?", minLabel: "GUARDED", maxLabel: "WIDE OPEN" },
      ],
    },
    {
      id: "notice",
      header: "TRUST IN YOUR BODY",
      sub: "The facilitator will guide a short body scan. As you listen, notice where trust and distrust live physically.",
      duration: "20 MIN",
      activities: [
        { type: "multipleChoice", key: "notice-trust-body", question: "When I am with someone I fully trust, my body feels:", options: ["RELAXED AND OPEN", "QUIET AND STILL", "ENERGISED AND PRESENT", "SOFT AND UNHURRIED", "SAFE TO BE MESSY"] },
        { type: "multipleChoice", key: "notice-distrust-body", question: "When I sense I cannot trust someone, my body:", options: ["TIGHTENS IN MY CHEST", "GOES ON HIGH ALERT", "SHUTS DOWN AND GOES QUIET", "WANTS TO LEAVE", "STARTS MONITORING EVERYTHING THEY DO"] },
        { type: "reflection", key: "notice-trusted-person", prompt: "Think of one person you trust deeply. What is it about them — or about being with them — that creates that feeling?" },
      ],
    },
    {
      id: "name",
      header: "WHAT TRUST IS ACTUALLY MADE OF",
      sub: "Researcher Brené Brown identified 7 components of trust. Tonight we explore them.",
      duration: "25 MIN",
      activities: [
        {
          type: "connectPairs",
          key: "name-braving",
          instruction: "Match each trust component to its meaning",
          left: ["BOUNDARIES", "RELIABILITY", "ACCOUNTABILITY", "VAULT", "INTEGRITY", "NON-JUDGEMENT", "GENEROSITY"],
          right: [
            "You respect my limits and I respect yours",
            "You do what you say you'll do, consistently",
            "You own your mistakes and make amends",
            "You keep confidences — mine and others'",
            "You practice your values, not just talk about them",
            "I can share without fear of being judged",
            "You assume the most generous interpretation of my actions",
          ],
          correct: [
            ["BOUNDARIES", "You respect my limits and I respect yours"],
            ["RELIABILITY", "You do what you say you'll do, consistently"],
            ["ACCOUNTABILITY", "You own your mistakes and make amends"],
            ["VAULT", "You keep confidences — mine and others'"],
            ["INTEGRITY", "You practice your values, not just talk about them"],
            ["NON-JUDGEMENT", "I can share without fear of being judged"],
            ["GENEROSITY", "You assume the most generous interpretation of my actions"],
          ],
        },
      ],
    },
    {
      id: "sort",
      header: "WHERE AM I STRONG AND WHERE AM I GROWING?",
      duration: "15 MIN",
      activities: [
        {
          type: "dragDrop",
          key: "sort-trust-inventory",
          instruction: "Sort these 7 trust behaviours into how you show up for OTHERS right now",
          cards: ["HOLDING BOUNDARIES", "FOLLOWING THROUGH", "KEEPING CONFIDENCES", "OWNING MY MISTAKES", "LIVING MY VALUES", "STAYING NON-JUDGEMENTAL", "ASSUMING GOOD INTENT"],
          columns: [
            { id: "strong", label: "I DO THIS WELL", correct: [] },
            { id: "growing", label: "THIS IS A GROWING EDGE FOR ME", correct: [] },
          ],
        },
        { type: "reflection", key: "sort-growing-edge", prompt: "Looking at your growing edges — what gets in the way of showing up this way?" },
      ],
    },
    {
      id: "iceberg",
      header: "WHAT'S BENEATH YOUR TRUST PATTERNS?",
      sub: "Most of what drives our trust behaviour is below the surface. Click each hidden card and write what lives beneath your waterline.",
      duration: "15 MIN",
      activities: [
        {
          type: "iceberg",
          key: "iceberg-trust",
          aboveLabel: "WHAT OTHERS SEE — MY TRUST BEHAVIOUR",
          belowLabel: "WHAT'S REALLY HAPPENING",
          cards: [
            "A fear that drives how I trust...",
            "A belief I have about whether people can be trusted...",
            "Something that happened that changed how I trust...",
            "What I'm really protecting when I hold back trust...",
            "What I wish people understood about why I am this way...",
          ],
        },
      ],
    },
    {
      id: "rewire",
      header: "ONE THING TO PRACTISE THIS WEEK",
      duration: "5 MIN",
      activities: [
        { type: "phraseBuilder", key: "rewire-practise", template: "This week I will practise ________ with ________ as a small act of building trust." },
        { type: "phraseBuilder", key: "rewire-strengthen", template: "The trust component I want to strengthen in myself is ________." },
        { type: "commitment", key: "commitment", stem: "Before Session 2, I will show up with more trust in my relationship with..." },
      ],
    },
  ],
};

export const trust2: SessionData = {
  id: "trust-2",
  title: "HOW TRUST BREAKS",
  subtitle: "UNDERSTANDING RUPTURE",
  duration: "90 MINUTES",
  sessionNumber: "SESSION 02 OF 03",
  series: trustSeries,
  nextSession: { label: "NEXT WEEK → SESSION 3: REBUILDING TRUST", path: "/session/trust-3" },
  sections: [
    {
      id: "arrive",
      header: "CHECK IN FROM SESSION 1",
      duration: "5 MIN",
      activities: [
        { type: "previousCommitment", key: "prev-commitment-1", sessionId: "trust-1", label: "YOUR SESSION 1 COMMITMENT WAS:" },
        { type: "scale", key: "arrive-commitment", statement: "How did I go with last week's commitment?", minLabel: "DIDN'T MANAGE IT", maxLabel: "NAILED IT" },
        { type: "scale", key: "arrive-mind", statement: "How much has trust been on my mind this week?", minLabel: "BARELY", maxLabel: "CONSTANTLY" },
        { type: "reflection", key: "arrive-notice", prompt: "What did you notice about trust this week — in yourself or others?" },
      ],
    },
    {
      id: "thermometer",
      header: "THE TRUST THERMOMETER",
      sub: "Let's get honest about where trust currently sits in your key relationships.",
      duration: "20 MIN",
      activities: [
        {
          type: "thermometer",
          key: "trust-landscape",
          title: "YOUR TRUST LANDSCAPE",
          thermometers: [
            { key: "rel-1", defaultLabel: "RELATIONSHIP 1", showNameInput: true },
            { key: "rel-2", defaultLabel: "RELATIONSHIP 2", showNameInput: true },
            { key: "rel-3", defaultLabel: "RELATIONSHIP 3", showNameInput: true },
          ],
        },
        { type: "reflection", key: "thermometer-reflect", prompt: "Looking at your thermometers — what surprised you? What didn't?" },
      ],
    },
    {
      id: "name",
      header: "THE ANATOMY OF A RUPTURE",
      sub: "Trust rarely breaks in one dramatic moment. Usually it erodes through small repeated experiences.",
      duration: "25 MIN",
      activities: [
        {
          type: "dragDrop",
          key: "sort-rupture",
          instruction: "Sort these trust-breaking experiences into how they land for you personally",
          cards: ["A broken promise", "A shared secret told", "Being dismissed when vulnerable", "Inconsistent behaviour", "Lies, even small ones", "Feeling invisible", "Being blamed unfairly", "Unreliability over time", "Betrayal of loyalty", "Not being believed"],
          columns: [
            { id: "deep", label: "CUTS DEEPEST FOR ME", correct: [] },
            { id: "recover", label: "I CAN RECOVER FROM THIS", correct: [] },
            { id: "not-experienced", label: "I HAVEN'T EXPERIENCED THIS", correct: [] },
          ],
        },
        {
          type: "iceberg",
          key: "iceberg-rupture",
          aboveLabel: "WHAT PEOPLE SEE WHEN I'VE BEEN HURT",
          belowLabel: "WHAT HAPPENS INSIDE",
          cards: [
            "What I tell myself about the person who hurt me...",
            "What I tell myself about myself when trust breaks...",
            "How I protect myself afterwards...",
            "What I do with the anger...",
            "What I secretly still want even though I'm hurt...",
            "What I'm most afraid will happen if I try to trust again...",
          ],
        },
      ],
    },
    {
      id: "connect",
      header: "WHAT HURT IS REALLY ASKING FOR",
      duration: "15 MIN",
      activities: [
        {
          type: "connectPairs",
          key: "connect-hurt",
          instruction: "Match each response to betrayal with what it's really seeking underneath",
          left: ["I go silent and withdraw", "I become hypervigilant", "I test them repeatedly", "I tell everyone what they did", "I pretend it didn't happen", "I end the relationship"],
          right: [
            "I need safety before I can reconnect",
            "I need reassurance that it won't happen again",
            "I need proof before I can believe it's safe",
            "I need to feel validated in my experience",
            "I need time before I can feel it",
            "I need to protect myself from further harm",
          ],
          correct: [
            ["I go silent and withdraw", "I need safety before I can reconnect"],
            ["I become hypervigilant", "I need reassurance that it won't happen again"],
            ["I test them repeatedly", "I need proof before I can believe it's safe"],
            ["I tell everyone what they did", "I need to feel validated in my experience"],
            ["I pretend it didn't happen", "I need time before I can feel it"],
            ["I end the relationship", "I need to protect myself from further harm"],
          ],
        },
      ],
    },
    {
      id: "story",
      header: "YOUR STORY",
      sub: "The facilitator will hold space now. This section is private — just for you.",
      duration: "15 MIN",
      activities: [
        { type: "phraseBuilder", key: "story-rupture", template: "The trust rupture that has most shaped how I show up in relationships is ________." },
        { type: "phraseBuilder", key: "story-decided", template: "After that, I decided (consciously or not) that ________." },
        { type: "phraseBuilder", key: "story-protects", template: "The way that decision still protects me today is ________." },
        { type: "phraseBuilder", key: "story-limits", template: "The way it might be limiting me is ________." },
        { type: "reflection", key: "story-current", prompt: "Is there a relationship right now where trust has been broken — either by you or toward you? What is one true thing you can say about it?" },
      ],
    },
    {
      id: "rewire",
      header: "FROM RUPTURE TOWARD REPAIR",
      duration: "5 MIN",
      activities: [
        { type: "scale", key: "rewire-ready", statement: "How ready do I feel to explore repair in my relationship?", minLabel: "NOT AT ALL", maxLabel: "READY" },
        { type: "scale", key: "rewire-responsibility", statement: "How much responsibility do I hold in this rupture?", minLabel: "NONE", maxLabel: "SIGNIFICANT" },
        { type: "commitment", key: "commitment", stem: "Before Session 3, I will acknowledge — to myself or out loud — that..." },
      ],
    },
  ],
};

export const trust3: SessionData = {
  id: "trust-3",
  title: "REBUILDING TRUST",
  subtitle: "THE WORK OF REPAIR",
  duration: "90 MINUTES",
  sessionNumber: "SESSION 03 OF 03",
  series: trustSeries,
  sections: [
    {
      id: "arrive",
      header: "THE FULL PICTURE",
      duration: "5 MIN",
      activities: [
        { type: "previousCommitment", key: "prev-commitment-1", sessionId: "trust-1", label: "YOUR SESSION 1 COMMITMENT:" },
        { type: "previousCommitment", key: "prev-commitment-2", sessionId: "trust-2", label: "YOUR SESSION 2 COMMITMENT:" },
        { type: "scale", key: "arrive-willing", statement: "How willing am I today to do the work of repair?", minLabel: "NOT WILLING", maxLabel: "FULLY WILLING" },
        { type: "scale", key: "arrive-hope", statement: "How much hope do I hold for this relationship?", minLabel: "VERY LITTLE", maxLabel: "A LOT" },
      ],
    },
    {
      id: "notice",
      header: "REPAIR IS NOT FORGETTING",
      sub: "Rebuilding trust does not mean pretending it didn't happen. It means choosing to move forward with honesty.",
      duration: "20 MIN",
      activities: [
        { type: "multipleChoice", key: "notice-first-reaction", question: "When I think about repairing trust, my first reaction is:", options: ["RELIEF — I WANT THIS", "FEAR — WHAT IF IT HAPPENS AGAIN", "RESISTANCE — WHY SHOULD I", "CONFUSION — I DON'T KNOW HOW", "GRIEF — FOR WHAT WAS LOST"] },
        { type: "reflection", key: "notice-what-if", prompt: "What would it mean for you personally if this relationship were repaired? What would become possible?" },
      ],
    },
    {
      id: "roadmap",
      header: "WHAT REPAIR ACTUALLY LOOKS LIKE",
      sub: "The facilitator will walk through each step. Map your relationship as you go.",
      duration: "25 MIN",
      activities: [
        {
          type: "dragDrop",
          key: "roadmap-rank",
          instruction: "Put these repair steps in the order YOU think matters most — drag to rank",
          cards: ["A genuine apology without excuses", "Changed behaviour over time", "Space to express the hurt without defence", "Explicit acknowledgement of what happened", "A conversation about what we both need going forward", "Rebuilding small moments of reliability", "Professional support if needed", "Patience — time is part of repair"],
          columns: [
            { id: "rank", label: "MOST TO LEAST IMPORTANT", correct: [] },
          ],
        },
        {
          type: "connectPairs",
          key: "roadmap-roles",
          instruction: "Match what repair requires from EACH person in the relationship",
          left: ["Own what happened without minimising", "Listen to the impact without defending", "Ask what is needed — don't assume", "Show changed behaviour consistently", "Accept that it takes time"],
          right: ["Allow space for genuine remorse", "Name the impact clearly and honestly", "Decide what you actually need", "Notice when small trust is being rebuilt", "Choose to move forward — when ready"],
          correct: [
            ["Own what happened without minimising", "Allow space for genuine remorse"],
            ["Listen to the impact without defending", "Name the impact clearly and honestly"],
            ["Ask what is needed — don't assume", "Decide what you actually need"],
            ["Show changed behaviour consistently", "Notice when small trust is being rebuilt"],
            ["Accept that it takes time", "Choose to move forward — when ready"],
          ],
        },
      ],
    },
    {
      id: "words",
      header: "THE WORDS YOU HAVEN'T SAID YET",
      sub: "This section is private. The facilitator will create space. No one will see this.",
      duration: "15 MIN",
      activities: [
        { type: "phraseBuilder", key: "words-impact", template: "What I need you to understand about how this affected me is ________." },
        { type: "phraseBuilder", key: "words-need", template: "What I need from you going forward is ________." },
        { type: "phraseBuilder", key: "words-offer", template: "What I am willing to offer this relationship is ________." },
        { type: "phraseBuilder", key: "words-forgive", template: "What I need to forgive myself for in this situation is ________." },
        { type: "reflection", key: "words-honest", prompt: "If you could say one completely honest thing to the person involved — with no fear of consequence — what would it be?" },
      ],
    },
    {
      id: "small-acts",
      header: "TRUST IS REBUILT IN INCHES",
      duration: "10 MIN",
      activities: [
        {
          type: "dragDrop",
          key: "small-acts-sort",
          instruction: "Sort these small trust-building actions — which ones feel possible for YOU right now?",
          cards: ["Send one honest message", "Show up when I said I would", "Admit something I got wrong", "Ask how they're really doing", "Keep one promise, however small", "Say the thing I've been avoiding", "Stop checking their behaviour for threats", "Let one good moment land without suspicion", "Ask for what I need instead of hoping they'll guess"],
          columns: [
            { id: "this-week", label: "I CAN DO THIS THIS WEEK", correct: [] },
            { id: "not-yet", label: "NOT YET — BUT MAYBE SOON", correct: [] },
          ],
        },
        {
          type: "thermometer",
          key: "trust-gap",
          title: "WHERE DO YOU WANT THIS RELATIONSHIP TO BE?",
          thermometers: [
            { key: "now", defaultLabel: "WHERE TRUST IS NOW" },
            { key: "future", defaultLabel: "WHERE I WANT IT IN 3 MONTHS" },
          ],
        },
        { type: "reflection", key: "trust-gap-reflect", prompt: "What is the gap between those two thermometers asking of you?" },
      ],
    },
    {
      id: "finale",
      header: "YOU'VE DONE 3 SESSIONS. NOW WHAT?",
      duration: "10 MIN",
      activities: [
        { type: "previousCommitment", key: "finale-c1", sessionId: "trust-1", label: "SESSION 1 COMMITMENT:" },
        { type: "previousCommitment", key: "finale-c2", sessionId: "trust-2", label: "SESSION 2 COMMITMENT:" },
        { type: "phraseBuilder", key: "finale-takeaway", template: "The biggest thing I am taking away from this series is ________." },
        { type: "phraseBuilder", key: "finale-invest", template: "The relationship I most want to invest in going forward is ________." },
        { type: "phraseBuilder", key: "finale-version", template: "The version of me that trusts and is trustworthy looks like ________." },
        { type: "seriesFinale", key: "declaration", lines: ["I commit to being trustworthy by", "I commit to extending trust by", "I commit to repairing trust by"] },
      ],
    },
  ],
};
