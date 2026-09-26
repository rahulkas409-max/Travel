/**
 * Shared domain types for RoamIndia seed data.
 * Everything here is plain, serialisable data so it can be persisted to
 * LocalStorage and rendered on the server or the client alike.
 */

export type Region = "north" | "west" | "south" | "east" | "central" | "northeast";
export type Tier = 1 | 2 | 3;

/** The four trip cohorts driven by the floating Vibe Bar. */
export type Occasion = "romantic" | "corporate" | "school" | "solo";

export type SlotType = "morning" | "afternoon" | "sunset" | "night";
export type Pace = "relaxed" | "balanced" | "packed";

export type Landscape = "mountains" | "beaches" | "palaces" | "forests";
export type Rhythm = "zen" | "thrill" | "social" | "spiritual";
export type BudgetTier = "backpacker" | "boutique" | "luxury";

export type ActivityKind =
  | "heritage"
  | "nature"
  | "adventure"
  | "food"
  | "nightlife"
  | "wellness"
  | "learning"
  | "team"
  | "spiritual"
  | "shopping"
  | "beach"
  | "romance";

export interface Zone {
  id: string;
  name: string;
  vibe: string;
}

export interface ZoneLink {
  from: string;
  to: string;
  /** Door-to-door minutes by the most common mode (cab / scooty). */
  mins: number;
  /** Friction note surfaced by the pacing meter. */
  note?: string;
}

export interface Activity {
  id: string;
  name: string;
  zone: string;
  /** Best time-of-day for this activity. */
  slot: SlotType;
  durationMins: number;
  occasions: Occasion[];
  kind: ActivityKind;
  /** Approx cost per person in INR (0 = free). */
  cost: number;
  tip: string;
  /** True for occasion templates that were instantiated for a destination. */
  generic?: boolean;
}

export interface TransitOption {
  mode: string;
  icon: "cab" | "scooty" | "bike" | "bus" | "train" | "flight" | "boat" | "auto" | "walk" | "jeep" | "metro";
  costRange: string;
  bestFor: string;
  tip: string;
}

export interface RentalRate {
  id: string;
  label: string;
  perDay: number;
  deposit: number;
  /** km per litre, used for fuel estimates (0 = fuel included / not applicable). */
  mileage: number;
  seats: number;
  note: string;
}

export interface EmergencyContact {
  label: string;
  number: string;
  note?: string;
}

export interface Destination {
  id: string;
  name: string;
  /** Sub-areas / neighbourhoods shown under the name. */
  aka?: string;
  region: Region;
  tier: Tier;
  state: string;
  tagline: string;
  tags: string[];
  /** Metres above sea level (approx, main town). */
  elevation: number;
  idealMonths: string;
  landscapes: Landscape[];
  rhythms: Rhythm[];
  budgets: BudgetTier[];
  /** Cohorts this place is genuinely good for. */
  occasions: Occasion[];
  imageKey: string;
  gateway: string;
  idealDays: [number, number];
  highlights: Activity[];
  zones?: Zone[];
  zoneLinks?: ZoneLink[];
  transit?: TransitOption[];
  rentals?: RentalRate[];
  scams?: string[];
  trainTips?: string[];
  hospital?: string;
  /** Destination has a strong farmhouse / estate / agro-tourism belt. */
  farmhouseHub?: boolean;
}

/* ─────────────────────────── Stays, farmhouses & reviews ─────────────────────────── */

export type TravellerTag =
  | "Solo Female Traveler"
  | "Solo"
  | "Couple"
  | "Honeymooners"
  | "Workationer"
  | "Family"
  | "Friends Group"
  | "Corporate Team"
  | "School Group";

export type PropertyKind =
  | "Boutique Hostel"
  | "Homestay"
  | "Boutique Hotel"
  | "Heritage Haveli"
  | "Luxury Resort"
  | "Private Farmhouse"
  | "Plantation Estate"
  | "Agro-Tourism Farm"
  | "Pool Villa"
  | "Jungle Lodge";

export type SuitabilityBadge =
  | "Ideal for Corporate Offsites"
  | "Couples' Private Sanctuary"
  | "School-Safe Approved"
  | "Workation Ready"
  | "Solo & Social";

export interface Review {
  id: string;
  author: string;
  from: string;
  tag: TravellerTag;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface RoomOption {
  name: string;
  priceRange: [number, number];
  sleeps: string;
}

export interface PropertyScores {
  cleanliness: number;
  location: number;
  value: number;
  food: number;
  safety: number;
  /** Only for properties with a pool. */
  pool?: number;
}

export interface Property {
  id: string;
  /** "stay" for hostels / homestays / hotels, "farm" for the farmhouse & agro hub. */
  collection: "stay" | "farm";
  destinationId: string;
  name: string;
  kind: PropertyKind;
  neighbourhood: string;
  neighbourhoodVibes: string[];
  address: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  priceRange: [number, number];
  priceUnit: "night" | "night (whole property)" | "person / night";
  rating: number;
  reviewCount: number;
  scores: PropertyScores;
  wifiMbps: number;
  capacity: number;
  amenities: string[];
  badges: SuitabilityBadge[];
  occasions: Occasion[];
  pros: string[];
  cons: string[];
  experiences?: string[];
  rooms: RoomOption[];
  imageKeys: string[];
  reviews: Review[];
  /** Paid placement tier — always shown with a visible "Sponsored" label. */
  sponsored?: "verified" | "featured";
}

/* ─────────────────────────── Food ─────────────────────────── */

export interface Dish {
  id: string;
  name: string;
  localName?: string;
  description: string;
  veg: boolean;
  spice: 1 | 2 | 3;
  priceRange: string;
}

export type EaterySpotType = "Dhaba" | "Street Lane" | "Legendary" | "Cafe" | "Fine Local";

export interface Eatery {
  id: string;
  name: string;
  type: EaterySpotType;
  area: string;
  mustOrder: string[];
  priceForTwo: number;
  hours: string;
  tip: string;
  veg: "veg" | "non-veg" | "both";
}

export interface FoodGuide {
  destinationId: string;
  intro: string;
  dishes: Dish[];
  spots: Eatery[];
}
