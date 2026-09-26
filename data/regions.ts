import type { EmergencyContact, Region, RentalRate, Tier, TransitOption } from "./types";

export interface RegionMeta {
  id: Region;
  name: string;
  short: string;
  emoji: string;
  blurb: string;
}

export const REGIONS: RegionMeta[] = [
  { id: "north", name: "North India", short: "North", emoji: "🏔️", blurb: "Himalayan valleys, Mughal cities & sacred ghats" },
  { id: "west", name: "West India", short: "West", emoji: "🏖️", blurb: "Goa coastline, Rajput palaces & Sahyadri farmhouses" },
  { id: "south", name: "South India", short: "South", emoji: "🌴", blurb: "Backwaters, coffee estates & temple towns" },
  { id: "east", name: "East India", short: "East", emoji: "🍵", blurb: "Tea gardens, mangroves & Bengal's culture capital" },
  { id: "central", name: "Central India", short: "Central", emoji: "🐅", blurb: "Tiger reserves, marble gorges & medieval temples" },
  { id: "northeast", name: "Northeast India", short: "Northeast", emoji: "🌧️", blurb: "Living root bridges, cloud valleys & river islands" },
];

export const TIER_LABEL: Record<Tier, string> = {
  1: "Tier 1 · Metro",
  2: "Tier 2 · Classic",
  3: "Tier 3 · Off-Beat",
};

/** Pan-India numbers every dossier carries. */
export const NATIONAL_EMERGENCY: EmergencyContact[] = [
  { label: "National Emergency", number: "112", note: "Police, fire & ambulance — works without SIM balance" },
  { label: "Police", number: "100" },
  { label: "Ambulance", number: "108", note: "Free state emergency ambulance" },
  { label: "Women Helpline", number: "1091" },
  { label: "Tourist Helpline (24×7, multilingual)", number: "1800-11-1363", note: "Also reachable on 1363" },
  { label: "Child Helpline", number: "1098", note: "Useful for school trip leaders" },
  { label: "Railway Helpline", number: "139" },
  { label: "Road Accident / Highway", number: "1033", note: "NHAI helpline on national highways" },
];

type RegionalDefaults = {
  transit: TransitOption[];
  rentals: RentalRate[];
  scams: string[];
  trainTips: string[];
};

const COMMON_TRAIN_TIPS = [
  "Book on IRCTC exactly when the window opens (60 days out at 8:00 AM); Tatkal opens 10:00 AM (AC) / 11:00 AM (non-AC) the day before.",
  "3A is the sweet spot for comfort vs price on overnight routes; 2A gives curtains and fewer co-passengers.",
  "Check the coach position board on the platform ~20 min before departure; big stations list it on the NTES app too.",
  "For groups of 10+ (school or office), use the IRCTC group booking / station PRS counter — tickets stay on one PNR.",
];

export const REGIONAL_DEFAULTS: Record<Region, RegionalDefaults> = {
  north: {
    transit: [
      { mode: "App cab (Uber / Ola)", icon: "cab", costRange: "₹15–22 / km", bestFor: "City hops & airport runs", tip: "In hill towns app cabs thin out — pre-book local taxi union cabs for ghat drives." },
      { mode: "HRTC / RSRTC Volvo", icon: "bus", costRange: "₹900–1,800 overnight", bestFor: "Delhi ↔ hills on a budget", tip: "Book on the state RTC site; semi-sleeper Volvos leave Kashmere Gate / ISBT between 5–9 PM." },
      { mode: "Royal Enfield / scooty", icon: "bike", costRange: "₹500–1,800 / day", bestFor: "Valleys & passes", tip: "Carry the rental papers + your licence; mountain checkposts do ask." },
      { mode: "Vande Bharat / Shatabdi", icon: "train", costRange: "₹700–2,500", bestFor: "Delhi ↔ Amritsar, Chandigarh, Varanasi, Jaipur", tip: "Day chair-car trains are fast and include meals on most routes." },
    ],
    rentals: [
      { id: "scooty", label: "Scooty (Activa)", perDay: 500, deposit: 2000, mileage: 45, seats: 2, note: "City & short valley loops" },
      { id: "enfield", label: "Royal Enfield 350", perDay: 1400, deposit: 5000, mileage: 30, seats: 2, note: "Passes & long rides" },
      { id: "suv", label: "Self-drive SUV", perDay: 3500, deposit: 10000, mileage: 12, seats: 7, note: "Families & groups" },
      { id: "tempo", label: "Tempo Traveller (with driver)", perDay: 6500, deposit: 0, mileage: 0, seats: 12, note: "Fuel & driver included — school / office groups" },
    ],
    scams: [
      "Touts at railway stations claiming your hotel is 'closed' or 'flooded' — call the property yourself.",
      "Fake 'government tourist office' shops near monuments; the real one is always marked India Tourism / state tourism.",
      "Rental bikes with pre-existing scratches — photograph and video the vehicle before you ride out.",
    ],
    trainTips: COMMON_TRAIN_TIPS,
  },
  west: {
    transit: [
      { mode: "App cab (Uber / Ola)", icon: "cab", costRange: "₹14–20 / km", bestFor: "Mumbai, Pune, Jaipur-style cities", tip: "Goa has GoaMiles as the government app cab; Uber/Ola don't operate there." },
      { mode: "Scooty rental", icon: "scooty", costRange: "₹350–600 / day", bestFor: "Goa, Diu, Alibaug beach hops", tip: "Only rent yellow-plate ('rent-a-bike') vehicles — white plates are private and illegal to rent." },
      { mode: "MSRTC / private sleeper", icon: "bus", costRange: "₹600–1,500", bestFor: "Mumbai/Pune ↔ Goa, Hampi", tip: "RedBus reviews are reliable for operator punctuality." },
      { mode: "Konkan Railway", icon: "train", costRange: "₹450–2,200", bestFor: "Mumbai ↔ Goa, Gokarna", tip: "Monsoon timetable (Jun–Oct) is slower — check before booking connections." },
    ],
    rentals: [
      { id: "scooty", label: "Scooty (Activa / Access)", perDay: 400, deposit: 1500, mileage: 45, seats: 2, note: "Beach belts & cafe hopping" },
      { id: "enfield", label: "Royal Enfield Classic", perDay: 1100, deposit: 3000, mileage: 32, seats: 2, note: "Coastal highways" },
      { id: "hatch", label: "Self-drive hatchback", perDay: 1800, deposit: 5000, mileage: 17, seats: 5, note: "Couples & small families" },
      { id: "tempo", label: "Tempo Traveller (with driver)", perDay: 5500, deposit: 0, mileage: 0, seats: 14, note: "Offsite / school groups" },
    ],
    scams: [
      "Unlicensed 'rent-a-bike' on white plates — you'll be the one fined at the checkpoint.",
      "Beach shack 'free sunbeds' with a surprise minimum spend — ask the rule before you sit.",
      "Autos quoting flat 'tourist rates' at stations; use the prepaid booth where one exists.",
    ],
    trainTips: COMMON_TRAIN_TIPS,
  },
  south: {
    transit: [
      { mode: "App cab / Namma Yatri auto", icon: "auto", costRange: "₹30 base + ₹15 / km", bestFor: "Bengaluru, Chennai, Kochi city", tip: "Namma Yatri (Bengaluru, Chennai, Kochi) is commission-free; drivers accept more rides." },
      { mode: "KSRTC / TNSTC buses", icon: "bus", costRange: "₹200–1,200", bestFor: "Hill towns & temple circuits", tip: "KSRTC Airavat / Ambaari sleeper buses are some of India's best-run." },
      { mode: "Taxi for ghats", icon: "cab", costRange: "₹3,000–4,500 / day", bestFor: "Munnar, Kodaikanal, Coorg", tip: "Hire a driver who knows the ghats; hairpins are tough in the monsoon." },
      { mode: "Express trains", icon: "train", costRange: "₹300–2,000", bestFor: "Metro ↔ metro, Varkala, Madurai", tip: "Southern Railway runs on time — book 3A for overnighters." },
    ],
    rentals: [
      { id: "scooty", label: "Scooty", perDay: 400, deposit: 2000, mileage: 45, seats: 2, note: "Varkala, Gokarna, Pondy lanes" },
      { id: "enfield", label: "Royal Enfield / Himalayan", perDay: 1200, deposit: 5000, mileage: 30, seats: 2, note: "Western Ghats rides" },
      { id: "sedan", label: "Cab with driver (sedan)", perDay: 3200, deposit: 0, mileage: 0, seats: 4, note: "Fuel & driver included, 250 km/day" },
      { id: "tempo", label: "Tempo Traveller (with driver)", perDay: 6000, deposit: 0, mileage: 0, seats: 12, note: "Groups" },
    ],
    scams: [
      "Autos refusing the meter at railway stations — walk 100 m out or use Namma Yatri.",
      "'Spice garden tours' that are really hard-sell shops — agree a tour-only price.",
      "Houseboat bookers promising AC all night; many run AC only 9 PM – 6 AM. Confirm in writing.",
    ],
    trainTips: COMMON_TRAIN_TIPS,
  },
  east: {
    transit: [
      { mode: "Yellow taxi / app cab", icon: "cab", costRange: "₹15–20 / km", bestFor: "Kolkata, Bhubaneswar", tip: "Kolkata's yellow Ambassadors run by meter + chart — ask to see the chart." },
      { mode: "Shared Sumo / jeep", icon: "jeep", costRange: "₹200–450 / seat", bestFor: "NJP ↔ Darjeeling, Kalimpong", tip: "Board at NJP / Siliguri stand; front seats cost a little more and are worth it." },
      { mode: "Toy train (DHR)", icon: "train", costRange: "₹800–1,700", bestFor: "Darjeeling joy ride", tip: "The Darjeeling–Ghum joy ride is 2 hrs with a Batasia Loop stop — book on IRCTC." },
      { mode: "Ferry / boat", icon: "boat", costRange: "₹1,500–4,000 / day", bestFor: "Sundarbans creeks", tip: "Only enter the core area with a licensed operator and forest permit." },
    ],
    rentals: [
      { id: "scooty", label: "Scooty", perDay: 450, deposit: 2000, mileage: 45, seats: 2, note: "Puri, Mandarmani beach belt" },
      { id: "enfield", label: "Royal Enfield", perDay: 1300, deposit: 5000, mileage: 30, seats: 2, note: "Hills around Kalimpong" },
      { id: "sumo", label: "Reserved Sumo / Bolero", perDay: 4000, deposit: 0, mileage: 0, seats: 8, note: "Hill circuits with driver" },
      { id: "tempo", label: "Tempo Traveller (with driver)", perDay: 6000, deposit: 0, mileage: 0, seats: 12, note: "Groups" },
    ],
    scams: [
      "Reserved-car touts at NJP inflating fares — check the prepaid taxi booth first.",
      "Fake 'VIP darshan' agents at Puri Jagannath — entry is free; ignore paid-queue offers.",
      "Sundarbans tours without permits — ask for the forest permit number before paying.",
    ],
    trainTips: COMMON_TRAIN_TIPS,
  },
  central: {
    transit: [
      { mode: "App cab / auto", icon: "auto", costRange: "₹14–18 / km", bestFor: "Indore, Bhopal, Raipur", tip: "Indore autos are metered and among the most honest in India." },
      { mode: "Safari Gypsy", icon: "jeep", costRange: "₹6,000–9,000 / gypsy / safari", bestFor: "Kanha, Bandhavgarh", tip: "Book via the MP Forest online portal the day slots open — core zones sell out." },
      { mode: "Taxi for circuits", icon: "cab", costRange: "₹3,000–4,000 / day", bestFor: "Khajuraho ↔ Orchha, Pachmarhi", tip: "Use a single cab for Jhansi → Orchha → Khajuraho; buses are infrequent." },
      { mode: "Shatabdi / Vande Bharat", icon: "train", costRange: "₹600–2,000", bestFor: "Delhi ↔ Gwalior, Jhansi, Bhopal", tip: "Jhansi is the rail gateway to Orchha (16 km)." },
    ],
    rentals: [
      { id: "scooty", label: "Scooty", perDay: 400, deposit: 2000, mileage: 45, seats: 2, note: "Town loops" },
      { id: "enfield", label: "Royal Enfield", perDay: 1200, deposit: 5000, mileage: 30, seats: 2, note: "Pachmarhi & Satpura roads" },
      { id: "sedan", label: "Cab with driver", perDay: 3000, deposit: 0, mileage: 0, seats: 4, note: "Heritage circuits" },
      { id: "tempo", label: "Tempo Traveller (with driver)", perDay: 5500, deposit: 0, mileage: 0, seats: 12, note: "Groups & school camps" },
    ],
    scams: [
      "Unofficial 'guides' at Khajuraho temples — hire ASI-approved guides with ID cards.",
      "Safari 'guaranteed tiger' packages — no one can guarantee sightings; avoid prepaying premiums.",
      "Gemstone and 'antique' shops near temple gates — buy only with a GST bill.",
    ],
    trainTips: COMMON_TRAIN_TIPS,
  },
  northeast: {
    transit: [
      { mode: "Shared Sumo / Tata Sumo", icon: "jeep", costRange: "₹300–700 / seat", bestFor: "Guwahati ↔ Shillong, Gangtok routes", tip: "Sumos leave when full — arrive by 7 AM for the best seats." },
      { mode: "Reserved cab", icon: "cab", costRange: "₹3,500–5,000 / day", bestFor: "Cherrapunji, Mawlynnong, Dawki", tip: "Club Shillong day trips — East Khasi Hills circuits are long loops." },
      { mode: "Helicopter (Pawan Hans)", icon: "flight", costRange: "₹3,000–4,500", bestFor: "Guwahati ↔ Shillong / Tawang", tip: "Weather-dependent; keep a buffer day." },
      { mode: "Ferry", icon: "boat", costRange: "₹20–1,500", bestFor: "Majuli from Nimati Ghat", tip: "Last ferry leaves around 3–4 PM; carry cash." },
    ],
    rentals: [
      { id: "scooty", label: "Scooty", perDay: 600, deposit: 3000, mileage: 45, seats: 2, note: "Shillong & Gangtok in-town" },
      { id: "enfield", label: "Royal Enfield Himalayan", perDay: 1800, deposit: 8000, mileage: 30, seats: 2, note: "Tawang, Ziro rides" },
      { id: "suv", label: "SUV with driver", perDay: 4500, deposit: 0, mileage: 0, seats: 6, note: "Hill circuits" },
      { id: "tempo", label: "Tempo Traveller (with driver)", perDay: 7000, deposit: 0, mileage: 0, seats: 12, note: "Groups" },
    ],
    scams: [
      "Arunachal & Nagaland need an Inner Line Permit — apply online (arunachalilp.com / ilp.nagaland.gov.in); agents charging extra aren't required.",
      "Unofficial 'village entry fees' — only pay at posted community counters (e.g., Mawlynnong, Double Decker trail).",
      "Sikkim restricted areas (Nathula, North Sikkim) need permits through registered agents only.",
    ],
    trainTips: [
      "Guwahati is the rail hub for the whole region; beyond it, roads and Sumos take over.",
      "Book Rajdhani / Vande Bharat to Guwahati early during Durga Puja and Bihu seasons.",
      ...COMMON_TRAIN_TIPS.slice(0, 2),
    ],
  },
};
