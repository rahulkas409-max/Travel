import { DESTINATIONS } from "./destinations";
import type { BudgetTier, Destination, Landscape, Occasion, Rhythm } from "./types";

export type QuizKey = "landscape" | "rhythm" | "occasion" | "budget";

export interface QuizOption<V extends string = string> {
  value: V;
  label: string;
  emoji: string;
  hint: string;
  /** Tailwind gradient classes for the visual option card. */
  gradient: string;
  imageKey: string;
}

export interface QuizQuestion<V extends string = string> {
  key: QuizKey;
  step: number;
  title: string;
  subtitle: string;
  options: QuizOption<V>[];
}

export const QUIZ: [
  QuizQuestion<Landscape>,
  QuizQuestion<Rhythm>,
  QuizQuestion<Occasion>,
  QuizQuestion<BudgetTier>,
] = [
  {
    key: "landscape",
    step: 1,
    title: "Where does your mind wander?",
    subtitle: "Pick the landscape you want outside your window.",
    options: [
      { value: "mountains", label: "Snowy Peaks", emoji: "🏔️", hint: "Passes, pine & powder", gradient: "from-sky-200 to-indigo-300", imageKey: "snow" },
      { value: "beaches", label: "Sun-kissed Beaches", emoji: "🏖️", hint: "Coves, shacks & sunsets", gradient: "from-marigold-100 to-rose-300", imageKey: "beach" },
      { value: "palaces", label: "Royal Forts & Palaces", emoji: "🏰", hint: "Havelis, bazaars & ramparts", gradient: "from-rose-100 to-marigold-400", imageKey: "palace" },
      { value: "forests", label: "Dense Forests & Waterfalls", emoji: "🌿", hint: "Mist, moss & monsoon", gradient: "from-sage-100 to-sage-400", imageKey: "waterfall" },
    ],
  },
  {
    key: "rhythm",
    step: 2,
    title: "What's your rhythm?",
    subtitle: "How should the days feel?",
    options: [
      { value: "zen", label: "Slow Zen & Reading", emoji: "📖", hint: "Hammocks, chai, no alarms", gradient: "from-sage-100 to-sand-300", imageKey: "cottage" },
      { value: "thrill", label: "High-Octane Treks & Scooty", emoji: "🛵", hint: "Summits, trails & throttle", gradient: "from-marigold-100 to-rose-400", imageKey: "mountain" },
      { value: "social", label: "Cafe-hopping & Nightlife", emoji: "🎶", hint: "Brunches, gigs & new friends", gradient: "from-rose-100 to-marigold-300", imageKey: "cafe" },
      { value: "spiritual", label: "Spiritual Awakening", emoji: "🪔", hint: "Aartis, monasteries & silence", gradient: "from-marigold-50 to-marigold-400", imageKey: "temple" },
    ],
  },
  {
    key: "occasion",
    step: 3,
    title: "Who's coming along?",
    subtitle: "We'll tune the plan to your crew.",
    options: [
      { value: "romantic", label: "Romantic", emoji: "💞", hint: "Honeymoon or anniversary", gradient: "from-rose-100 to-rose-400", imageKey: "villa" },
      { value: "corporate", label: "Corporate Retreat", emoji: "💼", hint: "Offsite or team trip", gradient: "from-sage-100 to-sage-400", imageKey: "lawn" },
      { value: "school", label: "Family / School", emoji: "🎒", hint: "Kids, students & learning", gradient: "from-marigold-100 to-sage-300", imageKey: "farm" },
      { value: "solo", label: "Friends / Solo", emoji: "🤙", hint: "Hostels & road trips", gradient: "from-marigold-100 to-marigold-400", imageKey: "hostel" },
    ],
  },
  {
    key: "budget",
    step: 4,
    title: "Daily budget per person?",
    subtitle: "Stay, food & local transport — flights not included.",
    options: [
      { value: "backpacker", label: "Backpacker", emoji: "🎒", hint: "Under ₹1,500 / day", gradient: "from-sand-200 to-sage-300", imageKey: "hostel" },
      { value: "boutique", label: "Boutique Comfort", emoji: "🛏️", hint: "₹2,500 – ₹5,000 / day", gradient: "from-sand-200 to-marigold-300", imageKey: "heritage-room" },
      { value: "luxury", label: "Luxury Heritage", emoji: "👑", hint: "₹8,000+ / day", gradient: "from-marigold-100 to-rose-400", imageKey: "haveli" },
    ],
  },
];

export interface QuizAnswers {
  landscape?: Landscape;
  rhythm?: Rhythm;
  occasion?: Occasion;
  budget?: BudgetTier;
}

export interface MatchResult {
  destination: Destination;
  score: number;
  /** 0–100 display percentage. */
  percent: number;
  reasons: string[];
}

const WEIGHTS = { landscape: 40, rhythm: 25, occasion: 22, budget: 13 } as const;

const LANDSCAPE_LABEL: Record<Landscape, string> = {
  mountains: "mountain air",
  beaches: "beach days",
  palaces: "royal heritage",
  forests: "forests & waterfalls",
};
const RHYTHM_LABEL: Record<Rhythm, string> = {
  zen: "slow, zen pace",
  thrill: "treks & scooty trails",
  social: "cafes & nightlife",
  spiritual: "spiritual calm",
};
const OCCASION_LABEL: Record<Occasion, string> = {
  romantic: "couples",
  corporate: "team offsites",
  school: "families & school groups",
  solo: "solo & friends trips",
};

/**
 * Vibe-mapping: scores every destination in the directory against the quiz.
 * Primary landscape match dominates, then rhythm, cohort fit and budget.
 * Off-beat (Tier 3) places get a small bonus for thrill-seekers — surprise
 * trips should feel like a discovery.
 */
export function scoreDestinations(answers: QuizAnswers): MatchResult[] {
  const results = DESTINATIONS.map((d) => {
    let score = 0;
    const reasons: string[] = [];

    if (answers.landscape) {
      const idx = d.landscapes.indexOf(answers.landscape);
      if (idx === 0) score += WEIGHTS.landscape;
      else if (idx > 0) score += WEIGHTS.landscape * 0.6;
      if (idx >= 0) reasons.push(`Made for ${LANDSCAPE_LABEL[answers.landscape]}`);
    }
    if (answers.rhythm) {
      const idx = d.rhythms.indexOf(answers.rhythm);
      if (idx === 0) score += WEIGHTS.rhythm;
      else if (idx > 0) score += WEIGHTS.rhythm * 0.7;
      if (idx >= 0) reasons.push(`Great for a ${RHYTHM_LABEL[answers.rhythm]}`);
    }
    if (answers.occasion && d.occasions.includes(answers.occasion)) {
      score += WEIGHTS.occasion;
      reasons.push(`Loved by ${OCCASION_LABEL[answers.occasion]}`);
    }
    if (answers.budget && d.budgets.includes(answers.budget)) {
      score += WEIGHTS.budget;
      reasons.push(answers.budget === "backpacker" ? "Easy on the wallet" : answers.budget === "luxury" ? "Top-tier heritage stays" : "Boutique stays at fair prices");
    }
    if (answers.rhythm === "thrill" && d.tier === 3) score += 4;
    if (answers.occasion === "corporate" && d.farmhouseHub) {
      score += 5;
      reasons.push("Farmhouse & resort belt for offsites");
    }
    if (answers.occasion === "school" && d.farmhouseHub) score += 3;

    return { destination: d, score, percent: 0, reasons };
  });

  // Absolute scale: a perfect 4/4 answer match (100 pts) reads as 99%.
  return results
    .map((r) => ({ ...r, percent: Math.max(35, Math.min(99, Math.round(r.score))) }))
    .sort((a, b) => b.score - a.score || a.destination.name.localeCompare(b.destination.name));
}

/** Pick the wheel segments: the top N matches (distinct), shuffled so the wheel doesn't look sorted. */
export function pickWheelSegments(matches: MatchResult[], count = 8, rng: () => number = Math.random): MatchResult[] {
  const top = matches.slice(0, count);
  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [top[i], top[j]] = [top[j], top[i]];
  }
  return top;
}

/** Weighted draw — better matches are likelier, but every segment can win. */
export function drawWinner(segments: MatchResult[], rng: () => number = Math.random): number {
  const weights = segments.map((s) => Math.pow(Math.max(1, s.score), 2));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return segments.length - 1;
}
