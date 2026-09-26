import type { ActivityKind, Occasion, SlotType } from "./types";

export interface OccasionMeta {
  id: Occasion;
  label: string;
  short: string;
  emoji: string;
  tagline: string;
  /** Tailwind gradient used for accent washes. */
  gradient: string;
  accentHex: string;
  stayHint: string;
  priorities: string[];
}

export const OCCASIONS: OccasionMeta[] = [
  {
    id: "romantic",
    label: "Romantic & Honeymoon",
    short: "Romantic",
    emoji: "💞",
    tagline: "Private sunsets, candlelit dinners & cosy cottages",
    gradient: "from-rose-400/30 via-marigold-400/20 to-transparent",
    accentHex: "#e06d53",
    stayHint: "Intimate boutique villas, pool villas and mountain cottages",
    priorities: ["Private sunset points", "Candlelit open-air dining", "Couples' spa & walks", "Late starts, no rush"],
  },
  {
    id: "corporate",
    label: "Corporate / Office Offsite",
    short: "Offsite",
    emoji: "💼",
    tagline: "Team villas, breakout lawns & barbecue nights",
    gradient: "from-sage-400/30 via-marigold-400/15 to-transparent",
    accentHex: "#588157",
    stayHint: "Resorts & farmhouses with lawns, banquet/projector and 50+ Mbps Wi-Fi",
    priorities: ["Conference & breakout spaces", "Team-building sports", "Evening barbecue zones", "Easy group logistics"],
  },
  {
    id: "school",
    label: "School Trip & Educational Camp",
    short: "School",
    emoji: "🎒",
    tagline: "Student-safe venues, agro farms & heritage forts",
    gradient: "from-marigold-400/35 via-sage-400/15 to-transparent",
    accentHex: "#d97706",
    stayHint: "Bulk-stay dorms & agro farms with strict security ratings",
    priorities: ["Verified student-safe venues", "Agro-tourism: farming, pottery, tractor rides", "Museums, planetariums & forts", "Early lights-out"],
  },
  {
    id: "solo",
    label: "Solo & Friends Adventure",
    short: "Solo/Friends",
    emoji: "🛵",
    tagline: "Social hostels, scooty trails & street food crawls",
    gradient: "from-marigold-400/30 via-rose-400/15 to-transparent",
    accentHex: "#f59e0b",
    stayHint: "Social hostels with dorms, privates and workation desks",
    priorities: ["Social hostels", "Street food crawls", "Rental scooters", "Treks & viewpoints"],
  },
];

export const OCCASION_BY_ID = Object.fromEntries(OCCASIONS.map((o) => [o.id, o])) as Record<Occasion, OccasionMeta>;

export interface ActivityTemplate {
  key: string;
  slot: SlotType;
  /** `{place}` is replaced with the destination name. */
  name: string;
  durationMins: number;
  kind: ActivityKind;
  cost: number;
  tip: string;
}

/**
 * Occasion templates keep every destination in the directory plannable.
 * They top up the curated highlights when a trip runs longer than a place's
 * hand-picked list, and always match the active cohort.
 */
export const OCCASION_TEMPLATES: Record<Occasion, ActivityTemplate[]> = {
  romantic: [
    { key: "slow-breakfast", slot: "morning", name: "Slow breakfast on a private terrace in {place}", durationMins: 90, kind: "romance", cost: 600, tip: "Ask the stay the night before to set up the terrace table — most boutique properties do it free." },
    { key: "couples-spa", slot: "afternoon", name: "Couples' spa ritual — local oils & herbal steam", durationMins: 120, kind: "wellness", cost: 3500, tip: "Book the 3–5 PM slot so you walk out just in time for golden hour." },
    { key: "artisan-hunt", slot: "afternoon", name: "Artisan quarter wander — pick a keepsake for each other", durationMins: 120, kind: "shopping", cost: 800, tip: "Set a surprise budget each and reveal gifts at dinner." },
    { key: "private-sunset", slot: "sunset", name: "Private sunset picnic at a quiet viewpoint near {place}", durationMins: 90, kind: "romance", cost: 700, tip: "Pack a thermos and a light shawl — temperatures drop fast after sundown." },
    { key: "candlelit-dinner", slot: "night", name: "Candlelit open-air dinner for two", durationMins: 120, kind: "romance", cost: 3200, tip: "Mention it's a honeymoon when booking — many places add a flower setup or dessert." },
    { key: "stargazing", slot: "night", name: "Blanket stargazing & hot chocolate", durationMins: 75, kind: "romance", cost: 0, tip: "Download a sky map app offline; look up ~40 minutes after the moon sets." },
  ],
  corporate: [
    { key: "sunrise-yoga", slot: "morning", name: "Sunrise yoga & team stretch on the lawn", durationMins: 60, kind: "wellness", cost: 300, tip: "Keep it optional and 45–60 min; send the calendar invite the night before." },
    { key: "strategy-huddle", slot: "morning", name: "Strategy huddle — conference hall with projector & breakout pods", durationMins: 180, kind: "team", cost: 800, tip: "Test HDMI/USB-C adapters and Wi-Fi speed the evening before; carry a clicker." },
    { key: "team-olympics", slot: "afternoon", name: "Team olympics — tug of war, relay & treasure hunt", durationMins: 150, kind: "team", cost: 600, tip: "Mix departments in teams; keep hydration stations and a first-aid kit on the lawn." },
    { key: "cook-off", slot: "afternoon", name: "Regional cook-off challenge with the resort chef", durationMins: 120, kind: "food", cost: 900, tip: "Give each team one local ingredient to hero — judges pick the winning dish for dinner." },
    { key: "sunset-townhall", slot: "sunset", name: "Sunset town hall & gratitude circle on the lawn", durationMins: 60, kind: "team", cost: 0, tip: "Keep slides off — a portable speaker and mic are enough." },
    { key: "bbq-awards", slot: "night", name: "Barbecue night, bonfire & team awards", durationMins: 150, kind: "team", cost: 1500, tip: "Confirm the barbecue cut-off time (often 10:30 PM) and noise rules with the property." },
    { key: "karaoke", slot: "night", name: "Karaoke & DJ in the private banquet", durationMins: 120, kind: "nightlife", cost: 800, tip: "Book the banquet exclusively so you're not sharing with a wedding party." },
  ],
  school: [
    { key: "heritage-worksheet", slot: "morning", name: "Guided heritage walk with activity worksheets in {place}", durationMins: 120, kind: "learning", cost: 150, tip: "Brief the guide on the grade level; split students into groups of 10 with a teacher each." },
    { key: "agro-farm", slot: "morning", name: "Agro-farm session — organic farming, pottery & tractor ride", durationMins: 180, kind: "learning", cost: 600, tip: "Closed shoes and caps mandatory; ask the farm for their safety briefing sheet in advance." },
    { key: "museum-qa", slot: "afternoon", name: "Science museum / planetarium visit with Q&A", durationMins: 150, kind: "learning", cost: 100, tip: "Most museums offer student concessions with a school letterhead — email ahead." },
    { key: "nature-journal", slot: "afternoon", name: "Naturalist trail — bird & leaf journaling", durationMins: 120, kind: "nature", cost: 200, tip: "Carry binocular sets for every 4 students and a headcount card." },
    { key: "sketch-hour", slot: "sunset", name: "Group sketching & reflection journal hour", durationMins: 60, kind: "learning", cost: 0, tip: "Collect journals for a mini exhibition on the last evening." },
    { key: "campfire", slot: "night", name: "Campfire, talent show & 9:30 PM lights-out", durationMins: 90, kind: "team", cost: 200, tip: "Do a headcount before and after; keep teachers on rotating corridor duty." },
    { key: "telescope", slot: "night", name: "Telescope stargazing & constellation quiz", durationMins: 75, kind: "learning", cost: 250, tip: "Many camps rent a telescope with an astronomy volunteer for the evening." },
  ],
  solo: [
    { key: "sunrise-hike", slot: "morning", name: "Sunrise hike to a local viewpoint above {place}", durationMins: 150, kind: "adventure", cost: 0, tip: "Share your live location with a hostel buddy and carry a headlamp." },
    { key: "scooty-loop", slot: "afternoon", name: "Scooty loop to hidden cafes & backroads", durationMins: 180, kind: "adventure", cost: 500, tip: "Top up fuel in town — village pumps close early or run dry." },
    { key: "street-crawl", slot: "afternoon", name: "Street food crawl — 5 stalls, ₹500 challenge", durationMins: 120, kind: "food", cost: 500, tip: "Follow the queues of locals and office-goers, not the Instagram crowd." },
    { key: "hostel-sunset", slot: "sunset", name: "Hostel rooftop sunset meetup", durationMins: 90, kind: "nightlife", cost: 200, tip: "Most social hostels post the evening plan on a whiteboard at reception." },
    { key: "open-mic", slot: "night", name: "Open-mic / live music night", durationMins: 150, kind: "nightlife", cost: 600, tip: "Thursdays and Saturdays usually have the best line-ups." },
    { key: "night-market", slot: "night", name: "Night market wander & chai", durationMins: 90, kind: "shopping", cost: 300, tip: "Bargain with a smile — 20–30% off the first quote is fair." },
  ],
};
