export type Person = {
  id: string;
  name: string;
  role: string;
  location: string;
  /** Two colours for the animated tile background */
  palette: [string, string];
  isHost?: boolean;
  /** Lines shown as live captions while this person speaks */
  lines: string[];
};

export const MEETING_TITLE = "Product launch sync";

export const HOST: Person = {
  id: "maya",
  name: "Sandra Fred",
  role: "Head of Product",
  location: "London",
  palette: ["#2563eb", "#7c3aed"],
  isHost: true,
  lines: [
    "Thanks for joining, everyone. Let's start with where the launch stands.",
    "The goal today is to lock the date and agree on the rollout order.",
    "Let's keep moving, we have about twenty minutes.",
    "Great, that settles the pricing question.",
    "Can we get a quick thumbs up if the date works for you?",
  ],
};

export const CAST: Person[] = [
  HOST,
  {
    id: "daniel",
    name: "Daniel Reyes",
    role: "Engineering Lead",
    location: "Madrid",
    palette: ["#0ea5e9", "#14b8a6"],
    lines: [
      "Backend is ready. We finished load testing on Friday.",
      "Recording storage handles three times our current peak.",
      "I'd like one more day for the mobile release notes.",
      "The rollout flag is in place, so we can go region by region.",
    ],
  },
  {
    id: "aisha",
    name: "Aisha Khan",
    role: "Design",
    location: "Dubai",
    palette: ["#db2777", "#f97316"],
    lines: [
      "The new waiting room screens are in the shared folder.",
      "We tested the join flow with twelve customers last week.",
      "Most people found the lobby controls without any help.",
      "I'll post the final screenshots in the chat.",
    ],
  },
  {
    id: "leo",
    name: "Leo Martin",
    role: "Customer Success",
    location: "Paris",
    palette: ["#16a34a", "#65a30d"],
    lines: [
      "Two enterprise customers asked for the launch date already.",
      "I'd love a short video walkthrough for the help centre.",
      "Support is ready for the first week.",
    ],
  },
  {
    id: "sofia",
    name: "Sofia Lindqvist",
    role: "Marketing",
    location: "Stockholm",
    palette: ["#9333ea", "#e11d48"],
    lines: [
      "I'll share the launch plan slides now.",
      "The announcement goes out on the Tuesday morning.",
      "We have webinar sign-ups from over forty countries.",
      "Next slide covers the regional timing.",
    ],
  },
  {
    id: "kenji",
    name: "Kenji Watanabe",
    role: "Sales, APAC",
    location: "Tokyo",
    palette: ["#ea580c", "#ca8a04"],
    lines: [
      "APAC would prefer the Wednesday, for time zone reasons.",
      "Three partners want early access for their teams.",
      "I can run the Tokyo webinar myself.",
    ],
  },
  {
    id: "grace",
    name: "Grace Mensah",
    role: "Finance",
    location: "Accra",
    palette: ["#0891b2", "#4f46e5"],
    lines: [
      "Pricing is approved for all regions.",
      "Annual plans keep the two month discount.",
    ],
  },
  {
    id: "noah",
    name: "Noah Fischer",
    role: "QA",
    location: "Berlin",
    palette: ["#475569", "#0f766e"],
    lines: [
      "No open blockers from the last test run.",
      "Screen sharing works on every browser we support.",
    ],
  },
];

/** Joins the waiting room partway through the meeting */
export const LATE_JOINER: Person = {
  id: "tom",
  name: "Tom Becker",
  role: "Partnerships",
  location: "Munich",
  palette: ["#be123c", "#7e22ce"],
  lines: ["Sorry I'm late, the previous call ran over.", "Partners are happy with the timing."],
};

export const SLIDES = [
  { kicker: "Launch plan", title: "Cenivo 3.0", body: "Lobby controls, live captions and faster recordings", accent: "#60a5fa" },
  { kicker: "Timeline", title: "Rollout by region", body: "EMEA on Tuesday · Americas on Tuesday afternoon · APAC on Wednesday", accent: "#34d399" },
  { kicker: "Readiness", title: "All teams on track", body: "Engineering ✓   Support ✓   Marketing ✓   Sales ✓", accent: "#f472b6" },
  { kicker: "Next steps", title: "Launch webinars", body: "Three live sessions with Q&A, hosted on Cenivo", accent: "#fbbf24" },
];

export const REACTIONS = ["👍", "👏", "❤️", "😂", "🎉", "🙌"] as const;

/** Scripted chat, keyed by seconds after joining */
export const SCRIPTED_CHAT: { at: number; from: string; text: string }[] = [
  { at: 3, from: "maya", text: "Morning everyone! Agenda: launch date, rollout order, webinars." },
  { at: 11, from: "aisha", text: "Waiting room designs are in the shared folder 🎨" },
  { at: 24, from: "leo", text: "Customers are asking about the date, so great timing" },
  { at: 42, from: "kenji", text: "+1 for Wednesday in APAC" },
  { at: 66, from: "daniel", text: "Load test report: all green ✅" },
  { at: 95, from: "grace", text: "Pricing sheet is final, sharing after the call" },
];

/** Replies to the visitor's first chat messages */
export const REPLIES = [
  { from: "maya", text: (name: string) => `Welcome, ${name}! Glad you could join.` },
  { from: "leo", text: () => "Good point, let's add that to the notes." },
  { from: "aisha", text: () => "Agreed 👍" },
  { from: "daniel", text: () => "I can follow up on that after the call." },
];

export const TIMELINE = {
  handRaise: 16,
  handLower: 34,
  lateJoiner: 28,
  presentationStart: 45,
  presentationEnd: 95,
};
