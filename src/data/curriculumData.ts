// 🧠 Curriculum Data — Full Airtable Content
// Auto-generated from mindcast-inner-work Airtable base 2026-05-05

export type MovementId = 'ground' | 'wound' | 'tend' | 'open';

export interface DigQuestions {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
}

export interface Lesson {
  number: number;
  title: string;
  movement: MovementId;
  movementLabel: string;
  status: 'Ready' | 'Draft' | 'WIP';

  // Theme
  themeSummary?: string;

  // Core content
  adultIdea?: string;
  adultEpisode?: string;
  adultMaterials?: string;

  // Dig questions
  digQuestions?: DigQuestions;

  // Tracks
  teenTrack?: string;
  kidsTrack?: string;

  // Facilitation
  facilitationNotes?: string;
  edgePrompt?: string;

  // Extra
  audioUrl?: string;
  slidesUrl?: string;
  externalResources?: string[];
}

export const MOVEMENTS: { id: MovementId; label: string; number: number; description: string }[] = [
  { id: 'ground', label: 'I — Ground', number: 1, description: 'Learning to know yourself.' },
  { id: 'wound', label: 'II — Wound', number: 2, description: 'Learning to heal yourself.' },
  { id: 'tend', label: 'III — Tend', number: 3, description: 'Learning to love yourself.' },
  { id: 'open', label: 'IV — Open', number: 4, description: 'Learning to understand and connect with others.' },
];

export const LESSONS: Lesson[] = [
  // ===========================
  // MOVEMENT I — Ground
  // ===========================
  {
    number: 1,
    title: 'The Question Underneath the Question',
    movement: 'ground',
    movementLabel: 'I — Ground',
    status: 'Ready',
    themeSummary:
      'Before we can do any real inner work, we need to get honest about what we\u2019re actually asking. Most of us walk around with surface-level questions (\u201cHow do I fix this?\u201d \u201cWhy do I feel stuck?\u201d) when the real work lives underneath. This session is about finding the deeper question our soul is actually asking.',
    adultIdea:
      'Most of us are walking around asking surface-level questions. The real work begins when we find the question underneath. The goal isn\u2019t fixing ourselves \u2014 it\u2019s understanding ourselves.',
    digQuestions: {
      q1: 'What question have you been asking yourself on repeat? (e.g. \u201cWhy am I like this?\u201d \u201cWhen will I feel better?\u201d)',
      q2: 'What do you think might be the question underneath that question?',
    },
    facilitationNotes:
      'This is the first session \u2014 tone matters. Keep it warm, grounded, not too heavy. Plant the seed: this is not about fixing. This is about understanding. Let people sit with the discomfort of not having an answer yet. The goal of this session is loosening, not solving.',
    edgePrompt:
      'What would it mean to stop trying to fix yourself for a moment, and instead just listen?',
    teenTrack:
      'Use the \u201cDig Questions\u201d directly \u2014 they\u2019re accessible for teens. No alternative resource needed. Focus on the question \u201cWhat have you been asking yourself?\u201d and help them name it without needing an answer yet.',
  },
  {
    number: 2,
    title: 'The Stories We Inherited',
    movement: 'ground',
    movementLabel: 'I \u2014 Ground',
    status: 'Ready',
    themeSummary:
      'We don\u2019t show up as blank slates. We carry stories \u2014 from our families, our cultures, our religions, our wounds. Some of these stories were told to us directly. Others we absorbed without anyone saying a word. This session is about separating the stories we were given from the ones we actually want to live by.',
    adultIdea:
      "We don't arrive as blank slates. We carry stories from family, culture, religion, and experience \u2014 some spoken, some absorbed. This session separates inherited narratives from the ones we'd actually choose.",
    digQuestions: {
      q1: 'What was the dominant story in your family about who you were supposed to be?',
      q2: 'Is there a story you\u2019ve been carrying that you\u2019re ready to question?',
    },
    teenTrack:
      'Direct questions work for teens. Frame as: \u201cWhat have people always told you about who you are?\u201d and \u201cDo you think that\u2019s true?\u201d',
    facilitationNotes:
      'This can stir up family loyalty conflicts \u2014 people may feel disloyal examining inherited stories. Remind the group: examining a story is not rejecting it. We\u2019re just looking at it. Some stories are worth keeping. The goal is choice, not rejection.',
    edgePrompt:
      'What\u2019s one story you\u2019ve been telling yourself that you\u2019re not even sure you believe anymore?',
    externalResources: [
      'Adult Children of Emotionally Immature Parents \u2014 Lindsay C. Gibson',
      'It Didn\u2019t Start With You \u2014 Mark Wolynn',
    ],
  },
  {
    number: 3,
    title: 'Performance vs. Person',
    movement: 'ground',
    movementLabel: 'I \u2014 Ground',
    status: 'Ready',
    themeSummary:
      'Many of us learned early that love, approval, and safety were conditional on how well we performed. We became good at doing instead of good at being. This session explores the gap between the version of us that shows up to perform and the person we actually are underneath.',
    adultIdea:
      'Many of us learned early that love and safety were conditional on performance. We mastered doing at the expense of being. This session explores the gap between who you perform as and who you actually are.',
    digQuestions: {
      q1: 'Where did you learn that your value was tied to what you did or achieved?',
      q2: 'What would it feel like to be loved for just being you \u2014 not for what you produce?',
    },
    teenTrack:
      'Teens connect quickly to this. Use: \u201cDo you ever feel like you have to be a certain version of yourself to be accepted?\u201d Keep it concrete with school, friends, social media.',
    facilitationNotes:
      'This is a tender one for high achievers and people-pleasers. Watch for minimising (\u201cIt wasn\u2019t that bad\u201d). Normalise the grief of realising love may have been conditional. This is often where tears come.',
    edgePrompt:
      'What would you lose if you stopped performing?',
    externalResources: [
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown',
      'Complex PTSD: From Surviving to Thriving \u2014 Pete Walker',
    ],
  },
  {
    number: 4,
    title: 'Body Wisdom',
    movement: 'ground',
    movementLabel: 'I \u2014 Ground',
    status: 'Ready',
    themeSummary:
      'We spend most of our lives in our heads, but the body carries wisdom we\u2019ve learned to ignore. This session is about coming back into the body \u2014 not as a concept, but as a real practice. Learning to feel, to regulate, and to trust the signals your body has been sending all along.',
    adultIdea:
      'We live in our heads, but the body carries wisdom we\u2019ve been trained to ignore. This session is about coming home to the body \u2014 feeling, regulating, and trusting its signals.',
    digQuestions: {
      q1: 'When was the last time you felt truly at home in your body?',
      q2: 'What is your body trying to tell you that you\u2019ve been too busy to hear?',
    },
    teenTrack:
      'Use the two Dig Questions directly. Frame body awareness as \u201clearning your body\u2019s language\u201d rather than \u201chealing trauma\u201d \u2014 less intimidating.',
    facilitationNotes:
      'This session may trigger dissociation for some \u2014 give permission to keep eyes open, move, or step out. Regulate before you educate. Consider a grounding exercise early. Don\u2019t push anyone into body awareness; invite, don\u2019t demand.',
    edgePrompt:
      'When\u2019s the last time you listened to your body instead of overriding it?',
    externalResources: [
      'The Body Keeps the Score \u2014 Bessel van der Kolk',
      'Waking the Tiger \u2014 Peter Levine',
    ],
  },
  {
    number: 5,
    title: "The Parts That Don't Fit the Story",
    movement: 'ground',
    movementLabel: 'I \u2014 Ground',
    status: 'Ready',
    themeSummary:
      'We all have parts of ourselves that don\u2019t fit the neat story we\u2019ve constructed \u2014 the anger that surprises us, the sadness that won\u2019t leave, the desires we\u2019re ashamed of. This session is about welcoming those parts instead of pathologising them. What if every part of you is trying to protect you?',
    adultIdea:
      'We all have parts that don\u2019t fit the story we\u2019ve constructed \u2014 the anger, the sadness, the parts we\u2019re ashamed of. This session asks: what if every part of you is trying to protect you?',
    digQuestions: {
      q1: 'What\u2019s a part of you that you\u2019ve tried to hide, suppress, or disown?',
      q2: 'If that part of you could speak, what would it say it\u2019s trying to protect you from?',
    },
    teenTrack:
      'Direct Dig Questions work. Normalise having \u201cdifferent versions\u201d of yourself. Use language like: \u201cThe version of you at school might be different from the version at home \u2014 and that\u2019s okay.\u201d',
    facilitationNotes:
      'IFS-adjacent work \u2014 be careful not to pathologise any part. Every part has good intent. Watch for the inner critic dominating. Some people will have strong reactions to naming disowned parts. Keep it curious, not clinical.',
    edgePrompt:
      'What would it feel like to stop fighting a part of yourself?',
    externalResources: [
      'No Bad Parts \u2014 Richard Schwartz',
      'Internal Family Systems (IFS) \u2014 general introduction',
    ],
  },
  {
    number: 6,
    title: 'A Portrait Not a Blueprint',
    movement: 'ground',
    movementLabel: 'I \u2014 Ground',
    status: 'Ready',
    themeSummary:
      'We spend so much time trying to become someone we\u2019re supposed to be. But what if the goal isn\u2019t transformation into a blueprint \u2014 but the slow, loving work of painting a portrait of who you actually are? This session closes Movement I by celebrating the person already here.',
    adultIdea:
      'The goal isn\u2019t to become someone you\u2019re supposed to be. It\u2019s the slow, loving work of painting a portrait of who you already are. This session celebrates that.',
    digQuestions: {
      q1: 'If you stopped trying to be a better version of yourself, who might you discover you already are?',
      q2: 'What\u2019s one thing you already love about the person you\u2019re becoming?',
    },
    facilitationNotes:
      'End of Movement I \u2014 let this land as a soft landing. This should feel like a breath after the preceding work. Encourage appreciation of progress, not critique of remaining work. Celebration is part of the curriculum.',
    edgePrompt:
      'What if you\u2019re already enough, right now, exactly as you are?',
    teenTrack:
      'Dig Questions are accessible. Frame as: \u201cIf there was no pressure to be anyone different, what would stay the same about you?\u201d',
    kidsTrack: 'Same approach as teen track \u2014 focus on self-appreciation.',
    externalResources: [
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown',
      'Self-Compassion \u2014 Kristin Neff',
    ],
  },

  // ===========================
  // MOVEMENT II \u2014 Wound
  // ===========================
  {
    number: 7,
    title: 'What Are You Carrying?',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'Before we can do any wound work, we need to name what we\u2019re actually carrying. This session asks: what\u2019s in your emotional backpack? Not to dump it all out at once \u2014 just to acknowledge the weight you\u2019ve been quietly holding.',
    adultIdea:
      'We all carry invisible weight. This session names the contents of your emotional backpack \u2014 not to dump it all at once, but to acknowledge the weight you\u2019ve been quietly holding.',
    digQuestions: {
      q1: 'What are you carrying right now that you haven\u2019t fully acknowledged?',
      q2: "If you could set down one thing today \u2014 just for a moment \u2014 what would it be?",
    },
    facilitationNotes:
      'This opens Movement II \u2014 set the container carefully. This movement will be the hardest. Remind them: we name the weight not to be crushed by it, but so we know what we\u2019re working with. Go slowly. Validate without fixing.',
    edgePrompt:
      'What would it feel like to admit how much you\u2019re actually carrying?',
  },
  {
    number: 8,
    title: 'Smart Ways We Avoid',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'We\u2019ve all developed clever strategies to avoid feeling the hard stuff. Productivity, busyness, people-pleasing, numbing, intellectualising \u2014 these are smart ways we avoid. This session is about recognising our avoidance patterns with compassion, not judgement.',
    adultIdea:
      'Productivity, busyness, people-pleasing, numbing, intellectualising \u2014 these are smart strategies we developed. This session recognises avoidance patterns with compassion, not judgement.',
    digQuestions: {
      q1: 'What\u2019s your smartest avoidance strategy \u2014 the one that looks the most productive?',
      q2: "If you stopped avoiding for one day, what might you feel?",
    },
    teenTrack:
      'Use: \u201cWhat do you do when you don\u2019t want to feel something?\u201d Teens will recognise doom-scrolling, gaming, overworking. Normalise it.',
    facilitationNotes:
      'This can feel confrontational (\u201cmy coping is BAD?\u201d). Reframe: avoidance kept you safe. These strategies worked. We\u2019re just noticing them now so we can choose differently. Avoidance is not failure \u2014 it\u2019s survival.',
    edgePrompt:
      'What would you have to feel if you stopped your favourite distraction?',
    externalResources: [
      'The Body Keeps the Score \u2014 Bessel van der Kolk',
      'Complex PTSD: From Surviving to Thriving \u2014 Pete Walker',
    ],
  },
  {
    number: 9,
    title: 'The Wound You Didn\u2019t Choose',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'Some of our deepest wounds weren\u2019t chosen \u2014 they were given to us before we had any say. This session looks at the wound you didn\u2019t choose, with honesty but without blame. Not to stay in the pain, but to finally see it clearly.',
    adultIdea:
      'Some wounds were given to us before we had a say. Van der Kolk says trauma doesn\u2019t require catastrophe \u2014 chronic experiences of being unseen or unsafe shape us just as deeply. This session names the wound you didn\u2019t choose, with accuracy not blame.',
    digQuestions: {
      q1: 'Van der Kolk says trauma doesn\u2019t require catastrophe \u2014 chronic experiences of being unseen or unsafe shape us just as deeply. Is there something in your upbringing that you\u2019ve minimised as \u201cnot that bad\u201d that might have left more of a mark than you\u2019ve acknowledged?',
      q2: 'What did you most need as a child that you didn\u2019t consistently receive? You can be honest here \u2014 this is not about blame. It\u2019s about accuracy.',
    },
    facilitationNotes:
      'This is potentially the most emotionally charged session in the movement. Go slow. Let silence sit. Van der Kolk\u2019s framing (\u201caccuracy, not blame\u201d) is crucial \u2014 return to it. Watch for participants shutting down or dissociating. Have grounding resources ready.',
    edgePrompt:
      'What did you need that you didn\u2019t get \u2014 and what did you tell yourself instead?',
    adultEpisode: 'The Body Trauma Expert: Bessel van der Kolk',
    teenTrack:
      'Diary of a CEO: Bessel van der Kolk \u2014 use the section on childhood nervous system development (accessible)\nAlternative: Dr. Nadine Burke Harris TED Talk \u201cHow Childhood Trauma Affects Health Across a Lifetime\u201d (15 min, very accessible for teens).',
    externalResources: [
      'Complex PTSD: From Surviving to Thriving \u2014 Pete Walker',
      'It Didn\u2019t Start With You \u2014 Mark Wolynn',
      'Adult Children of Emotionally Immature Parents \u2014 Lindsay C. Gibson',
      'The Body Keeps the Score \u2014 Bessel van der Kolk (essential)',
    ],
  },
  {
    number: 10,
    title: 'The Wound You Keep Reopening',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'We all have patterns we keep repeating. The same fight. The same type of person. The same wall we run into. This session is about the wound you keep reopening \u2014 not because you\u2019re broken, but because something inside is still trying to be healed.',
    adultIdea:
      'We all repeat patterns. Same fights. Same types. Same walls. This session explores the wound you keep reopening \u2014 not because you\u2019re broken, but because something inside is still trying to be healed.',
    digQuestions: {
      q1: 'What\u2019s a pattern you keep repeating \u2014 in relationships, work, or how you treat yourself?',
      q2: 'What might that pattern be trying to show you about an older wound?',
    },
    teenTrack:
      'Teens feel this in friendships. Use: \u201cDo you find yourself in the same type of friendship conflict over and over?\u201d',
    facilitationNotes:
      'This can feel hopeless (\u201cI keep doing the same thing!\u201d). Reframe: repetition is not failure \u2014 it\u2019s information. The pattern is pointing somewhere. This week is about following the breadcrumbs, not judging yourself for the loop.',
    edgePrompt:
      'What if the pattern you hate most is actually pointing you toward what still needs healing?',
    externalResources: [
      'Complex PTSD: From Surviving to Thriving \u2014 Pete Walker',
      'Attached \u2014 Amir Levine & Rachel Heller',
    ],
  },
  {
    number: 11,
    title: 'Grief as Love',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'Grief is not the opposite of love \u2014 it\u2019s love with nowhere to go. This session re-frames grief not as something to get over, but as evidence of how deeply we\u2019ve loved. For everything we\u2019ve lost, everything we never had, and everything we\u2019re still mourning.',
    adultIdea:
      'Grief is not the opposite of love \u2014 it\u2019s love with nowhere to go. This session reframes grief as evidence of depth. For what we\u2019ve lost, what we never had, and what we\u2019re still mourning.',
    digQuestions: {
      q1: 'What are you still grieving \u2014 a loss, a relationship, a version of yourself, a childhood you wish you\u2019d had?',
      q2: 'If grief is love with nowhere to go, what does your grief say about what you\u2019ve loved?',
    },
    teenTrack:
      'Gentle framing: \u201cWhat\u2019s something or someone you miss?\u201d Let them lead. Don\u2019t push. Grief in teens can show as anger or withdrawal.',
    facilitationNotes:
      'Hold this session with care. Grief is not linear. Some may not have cried in years \u2014 this could unlock it. Don\u2019t rush to comfort. Let grief be grieved. Consider having tissues and a moment of silence available.',
    edgePrompt:
      'What if your grief isn\u2019t a problem to solve, but proof that you loved?',
    externalResources: [
      'It\u2019s OK That You\u2019re Not OK \u2014 Megan Devine',
      'The Grief Recovery Handbook \u2014 John James & Russell Friedman',
    ],
  },
  {
    number: 12,
    title: 'Permission to Not Be Fine',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'We live in a culture that demands we be okay. Positive vibes only. Keep going. Push through. This session is about giving yourself and each other radical permission to not be fine. Not as a pit of despair, but as an act of honesty.',
    adultIdea:
      'We live in a culture that demands we be okay. This session gives radical permission to not be fine \u2014 not as despair, but as honesty. You don\u2019t have to perform wellness.',
    digQuestions: {
      q1: 'Where do you feel pressure to be fine when you\u2019re not?',
      q2: 'What would it feel like to tell one person the truth about how you\u2019re actually doing?',
    },
    teenTrack:
      'Direct Dig Questions work well. Frame: \u201cWho do you feel like you have to pretend to be okay for?\u201d This often unlocks honest conversation.',
    facilitationNotes:
      'This can be freeing but also scary \u2014 some have never said \u201cI\u2019m not fine\u201d aloud. Model it yourself if you can. Create space for honest answers without fixing. The goal is permission, not problem-solving.',
    edgePrompt:
      'What would it cost you to stop pretending you\u2019re fine?',
    externalResources: [
      'It\u2019s OK That You\u2019re Not OK \u2014 Megan Devine',
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown',
    ],
  },
  {
    number: 13,
    title: 'What Healing Looks Like',
    movement: 'wound',
    movementLabel: 'II \u2014 Wound',
    status: 'Ready',
    themeSummary:
      'We\u2019ve spent Movement II looking at the wound honestly. Now: what does healing actually look like? Not the Instagram version \u2014 the real one. The slow one. The one that still has hard days. This session closes the wound movement with a vision of healing that is honest, compassionate, and possible.',
    adultIdea:
      'After looking at the wound honestly: what does healing actually look like? Not the Instagram version \u2014 the slow, real, non-linear one. This session closes Movement II with a vision of healing that is honest and possible.',
    digQuestions: {
      q1: 'What has healing looked like in your life so far \u2014 even the small moments?',
      q2: 'What do you need to hear about healing right now?',
    },
    facilitationNotes:
      'End of Movement II \u2014 this should feel like exhaling after the deep work. Validate how far they\u2019ve come. Healing is not \u201cI\u2019m fixed\u201d \u2014 it\u2019s \u201cI\u2019m learning to hold myself differently.\u201d Leave them with hope, not pressure.',
    edgePrompt:
      'What if healing isn\u2019t about becoming whole, but learning to hold all of yourself?',
    externalResources: [
      'The Body Keeps the Score \u2014 Bessel van der Kolk',
      'Complex PTSD: From Surviving to Thriving \u2014 Pete Walker',
      'Self-Compassion \u2014 Kristin Neff',
    ],
  },

  // ===========================
  // MOVEMENT III \u2014 Tend
  // ===========================
  {
    number: 14,
    title: 'The Voice in Your Head',
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'There\u2019s a voice in your head that talks to you constantly. Is it kind? Is it cruel? Is it your voice, or one you absorbed? This session is about noticing the inner voice and beginning to change the channel.',
    adultIdea:
      'There\u2019s a voice in your head that talks to you constantly. Is it kind? Is it yours? This session notices the inner critic and begins the practice of changing the channel.',
    digQuestions: {
      q1: 'When you make a mistake, what does the voice in your head say to you?',
      q2: 'Whose voice do you think that really is?',
    },
    teenTrack:
      'Direct Dig Questions. Frame as: \u201cWhat do you say to yourself when things go wrong?\u201d Teens often have a harsh inner voice \u2014 normalise it without endorsing it.',
    facilitationNotes:
      'This opens Movement III (Tend) \u2014 a gentler movement than II. The inner critic can be deeply ingrained. Don\u2019t expect transformation in one session \u2014 just noticing is the work this week.',
    edgePrompt:
      'Would you let someone else talk to you the way you talk to yourself?',
    externalResources: [
      'Self-Compassion \u2014 Kristin Neff',
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown',
    ],
  },
  {
    number: 15,
    title: 'Deserving',
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'Do you believe you deserve good things? Not intellectually \u2014 in your bones. Many of us carry a deep sense of unworthiness that no achievement can fix. This session sits with the question of deserving \u2014 not as a concept, but as a felt experience.',
    adultIdea:
      'Do you believe you deserve good things \u2014 not intellectually, but in your bones? This session sits with the question of deserving as a felt experience, not a concept.',
    digQuestions: {
      q1: 'Deep down, do you believe you deserve to be happy? If not, when did you decide that?',
      q2: 'What would change if you truly believed you were worthy of love and care?',
    },
    teenTrack:
      'Frame as: \u201cDo you feel like you have to earn good things, or can you just have them?\u201d',
    facilitationNotes:
      'This can feel vulnerable. Worthiness wounds run deep. Don\u2019t try to convince anyone they\u2019re worthy \u2014 that\u2019s not how it works. Just create space for the question. The shift happens slowly.',
    edgePrompt:
      'What if you didn\u2019t have to earn love?',
    externalResources: [
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown',
      'Self-Compassion \u2014 Kristin Neff',
    ],
  },
  {
    number: 16,
    title: "What You'd Say to Someone You Loved",
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'We are often kinder to others than we are to ourselves. This session asks: if someone you loved were going through what you\u2019re going through, what would you say to them? And what would it mean to say that to yourself?',
    adultIdea:
      'We\u2019re often kinder to others than ourselves. This session asks: if someone you loved were in your shoes, what would you say? Then: what if you said that to yourself?',
    digQuestions: {
      q1: 'If your best friend told you what you\u2019ve been telling yourself, what would you say to them?',
      q2: 'What\u2019s stopping you from saying that to yourself?',
    },
    teenTrack:
      'Direct Dig Questions work well. Teens are great at giving advice to friends but terrible at taking their own. Use that gap.',
    facilitationNotes:
      'This is often where the shift from critic to compassionate self begins. The question creates distance from the inner critic. Don\u2019t force self-compassion \u2014 just create the contrast between how we treat others vs ourselves.',
    edgePrompt:
      'What would change if you treated yourself like someone you love?',
    externalResources: [
      'Self-Compassion \u2014 Kristin Neff',
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown',
    ],
  },
  {
    number: 17,
    title: 'Rest as Value',
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'We live in a culture that equates rest with laziness and productivity with worth. This session re-frames rest not as a reward for hard work, but as a fundamental human need and a value in itself. Rest as resistance. Rest as restoration.',
    adultIdea:
      'We equate productivity with worth. This session reframes rest not as a reward for hard work, but as a fundamental human need and value in itself. Rest as resistance. Rest as restoration.',
    digQuestions: {
      q1: 'What would it mean to believe that rest is something you deserve, not something you have to earn?',
      q2: 'What would you do with your time if you weren\u2019t trying to be productive?',
    },
    teenTrack:
      'Frame: \u201cDo you ever feel guilty when you\u2019re not doing something?\u201d Relevant for teens in high-pressure school environments.',
    facilitationNotes:
      'This can be harder for high achievers than the wound work. The resistance to rest is real. Don\u2019t shame anyone for struggling with this. Just name the conditioning and invite experimentation.',
    edgePrompt:
      'What would it feel like to rest without guilt?',
    externalResources: [
      'Rest Is Resistance \u2014 Tricia Hersey (The Nap Ministry)',
      'Laziness Does Not Exist \u2014 Devon Price',
    ],
  },
  {
    number: 18,
    title: 'The Need You Keep Deferring',
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'There\u2019s something you need \u2014 and you keep putting it off. Rest, a conversation, a boundary, help, permission to stop. This session is about naming the need you keep deferring and taking one small step toward meeting it.',
    adultIdea:
      'There\u2019s something you need that you keep deferring. Rest, a conversation, a boundary, help, permission to stop. This session names that need and takes one small step toward meeting it.',
    digQuestions: {
      q1: 'What\u2019s a need you keep putting off \u2014 telling yourself \u201clater\u201d or \u201cwhen things calm down\u201d?',
      q2: 'What\u2019s one small thing you could do this week to honour that need?',
    },
    teenTrack:
      'Frame as: \u201cWhat\u2019s something you know you need but keep avoiding?\u201d Could be sleep, a conversation, a break from social media.',
    facilitationNotes:
      'Action-oriented session. Encourage small steps, not grand gestures. The goal is self-trust \u2014 proving to yourself that you\u2019ll show up for your own needs. Celebrate tiny wins.',
    edgePrompt:
      'What would it mean to finally take your own needs seriously?',
    externalResources: [
      'Set Boundaries, Find Peace \u2014 Nedra Glover Tawwab',
      'The Art of Extreme Self-Care \u2014 Cheryl Richardson',
    ],
  },
  {
    number: 19,
    title: 'Forgiving Yourself',
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'There\u2019s something you still hold against yourself. A mistake. A choice. A version of you that you\u2019re ashamed of. This session is about the difficult, tender work of self-forgiveness \u2014 not as letting yourself off the hook, but as finally putting the hook down.',
    adultIdea:
      'There\u2019s something you still hold against yourself \u2014 a mistake, a choice, a version of you you\u2019re ashamed of. This session is the tender work of self-forgiveness. Not letting yourself off the hook \u2014 putting the hook down.',
    digQuestions: {
      q1: 'What\u2019s one thing you\u2019re still holding against yourself?',
      q2: 'What would forgiveness for that look like \u2014 not as a concept, but as a real possibility?',
    },
    teenTrack:
      'Gentle framing: \u201cIs there something you\u2019ve done that you still feel bad about?\u201d Don\u2019t push. Allow silence.',
    facilitationNotes:
      'This is delicate. For some, self-forgiveness feels impossible or undeserved. Never force it. The goal is not to achieve forgiveness in one session \u2014 it\u2019s to open the door. Name the difference between guilt (\u201cI did something bad\u201d) and shame (\u201cI am bad\u201d).',
    edgePrompt:
      'What would it mean to forgive yourself for being human?',
    externalResources: [
      'The Gifts of Imperfection \u2014 Bren\u00e9 Brown (shame section)',
      'Radical Acceptance \u2014 Tara Brach',
    ],
  },
  {
    number: 20,
    title: 'Becoming Your Own Companion',
    movement: 'tend',
    movementLabel: 'III \u2014 Tend',
    status: 'Ready',
    themeSummary:
      'What if the most important relationship you\u2019ll ever have is the one with yourself? This session closes Movement III by exploring what it means to become your own companion \u2014 not in a lonely way, but in a way that means you\u2019re never truly alone.',
    adultIdea:
      'The most important relationship you will ever have is with yourself. This session closes Movement III by exploring what it means to become your own companion — not in a lonely way, but in a way that means you are never truly alone.',
    digQuestions: {
      q1: 'What does it feel like to spend time alone with yourself?',
      q2: 'What would it take to become a companion to yourself — someone you can come back to?',
    },
    facilitationNotes:
      'End of Movement III — celebrate the inward turn. Self-companionship is the foundation for everything in Movement IV.',
    edgePrompt:
      'What if being alone with yourself could feel like coming home?',
  },
];

export const LESSONS_BY_NUMBER: Map<number, Lesson> = new Map(LESSONS.map(l => [l.number, l]));


