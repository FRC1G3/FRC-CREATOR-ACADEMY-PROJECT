// Database fixtures only; these do not replace src/data UI fixtures.
export const seedModules = [
  {
    title: "YouTube Basics", quizSlug: "youtube-basics", quizTitle: "Fundamentals Check",
    lessons: [
      { slug: "how-youtube-works", title: "How YouTube Works", seconds: 754 },
      { slug: "setting-up-your-channel", title: "Setting Up Your Channel", seconds: 720 },
      { slug: "creator-mindset", title: "Building a Creator Mindset", seconds: 660 },
    ],
    questions: [
      { text: "What should a new channel focus on first?", options: ["A clear audience and purpose", "Buying subscribers", "Uploading random topics", "Copying every trend"], correct: 0 },
      { text: "What helps viewers understand a channel?", options: ["Unrelated banners", "Consistent branding and a clear description", "No channel description", "Changing names daily"], correct: 1 },
      { text: "Which habit supports sustainable creation?", options: ["Ignoring feedback", "Publishing only once", "A realistic schedule and regular practice", "Avoiding planning"], correct: 2 },
    ],
  },
  {
    title: "Audience & Niche", quizSlug: "audience-niche", quizTitle: "Audience & Niche Check",
    lessons: [
      { slug: "finding-your-niche", title: "Finding Your Niche", seconds: 920 },
      { slug: "understanding-your-audience", title: "Understanding Your Audience", seconds: 1090 },
      { slug: "researching-viewer-needs", title: "Researching Viewer Needs", seconds: 780 },
    ],
    questions: [
      { text: "What is a useful starting point for a niche?", options: ["Every possible topic", "A specific audience need you can address", "Only the biggest channel", "A random keyword"], correct: 1 },
      { text: "Which source can reveal viewer questions?", options: ["Comments and audience research", "Only your logo", "Unrelated ads", "Guessing without feedback"], correct: 0 },
      { text: "What should an audience profile describe?", options: ["Only equipment brands", "Only upload times", "Every person online", "Viewer goals, interests and problems"], correct: 3 },
    ],
  },
  {
    title: "Content Strategy", quizSlug: "content-strategy", quizTitle: "Strategy Check",
    lessons: [
      { slug: "finding-video-ideas", title: "Finding Video Ideas", seconds: 865 },
      { slug: "thumbnail-psychology", title: "Thumbnail Psychology", seconds: 1000 },
      { slug: "writing-better-titles", title: "Writing Better Titles", seconds: 1092 },
    ],
    questions: [
      { text: "What makes a useful video idea?", options: ["It answers a relevant audience question", "It copies a title exactly", "It has no clear topic", "It ignores the audience"], correct: 0 },
      { text: "What makes a strong thumbnail?", options: ["As much text as possible", "A clear, intriguing visual that matches the topic", "A random frame", "Every bright color at once"], correct: 1 },
      { text: "What should a good title do?", options: ["Promise something absent from the video", "Hide the topic", "Communicate value clearly and honestly", "Repeat unrelated keywords"], correct: 2 },
    ],
  },
  {
    title: "Video Production", quizSlug: "video-production", quizTitle: "Video Production Check",
    lessons: [
      { slug: "planning-your-shoot", title: "Planning Your Shoot", seconds: 840 },
      { slug: "lighting-and-audio", title: "Lighting and Audio", seconds: 960 },
      { slug: "editing-basics", title: "Editing Basics", seconds: 1140 },
    ],
    questions: [
      { text: "What helps a shoot run smoothly?", options: ["No preparation", "Changing goals constantly", "A simple shot list", "Skipping audio checks"], correct: 2 },
      { text: "What improves spoken audio?", options: ["Reducing background noise and checking levels", "Recording far from the microphone", "Clipping every recording", "Ignoring microphone placement"], correct: 0 },
      { text: "Why remove unnecessary pauses in an edit?", options: ["To hide the topic", "To add random effects", "To make audio unclear", "To improve pacing and clarity"], correct: 3 },
    ],
  },
  {
    title: "Analytics & Growth", quizSlug: "analytics-growth", quizTitle: "Analytics & Growth Check",
    lessons: [
      { slug: "understanding-ctr", title: "Understanding CTR", seconds: 720 },
      { slug: "audience-retention", title: "Audience Retention", seconds: 900 },
      { slug: "improving-with-analytics", title: "Improving with Analytics", seconds: 840 },
    ],
    questions: [
      { text: "What does impression click-through rate describe?", options: ["Total comments", "How often an impression leads to a view", "Subscriber age", "Video length"], correct: 1 },
      { text: "What can a retention drop help identify?", options: ["A moment viewers lose interest", "The camera brand", "The exact next viral topic", "A guaranteed income"], correct: 0 },
      { text: "How should you use analytics?", options: ["Judge everything from one view", "Ignore context", "Test improvements and compare patterns", "Stop experimenting"], correct: 2 },
    ],
  },
  {
    title: "Monetization", quizSlug: "monetization", quizTitle: "Monetization Check",
    lessons: [
      { slug: "creator-revenue-streams", title: "Creator Revenue Streams", seconds: 780 },
      { slug: "brand-partnerships", title: "Brand Partnerships", seconds: 900 },
      { slug: "building-a-sustainable-business", title: "Building a Sustainable Business", seconds: 960 },
    ],
    questions: [
      { text: "Why consider several revenue streams?", options: ["To ignore viewers", "To avoid planning", "To guarantee instant success", "To reduce reliance on one income source"], correct: 3 },
      { text: "What matters when choosing a brand partnership?", options: ["Audience fit and transparent disclosure", "Hiding sponsorship", "Promoting anything", "Ignoring product quality"], correct: 0 },
      { text: "Which practice supports a sustainable creator business?", options: ["Ignoring costs", "Tracking costs and planning realistic goals", "Spending every payment immediately", "Making promises without evidence"], correct: 1 },
    ],
  },
];

export const seedBadges = [
  { slug: "creator-starter", name: "Creator Starter", description: "Complete your first roadmap section.", icon: "play", conditionType: "FIRST_SECTION_COMPLETE", conditionValue: 1 },
  { slug: "quiz-master", name: "Quiz Master", description: "Pass three checkpoint quizzes.", icon: "star", conditionType: "QUIZ_COUNT", conditionValue: 3 },
  { slug: "consistent-creator", name: "Consistent Creator", description: "Maintain a seven-day learning streak.", icon: "flame", conditionType: "STREAK", conditionValue: 7 },
  { slug: "youtube-creator", name: "YouTube Creator", description: "Complete the YouTube Creator Mastery course.", icon: "trophy", conditionType: "COURSE_COMPLETE", conditionValue: null },
];
