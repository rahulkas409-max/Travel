# RoamIndia 🧭

A free, personalised India itinerary builder, travel guide and surprise-trip roulette. It's built mobile- and tablet-first, and it has no paywall, no login and no tracking. All state lives in the browser's LocalStorage.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
npm run lint && npm run typecheck
```

Requires Node 18.18+ (tested on Node 22).

## What's inside

| Module | Route | Highlights |
| --- | --- | --- |
| **The Vibe Bar** | every page | Floating occasion toggle (Romantic · Offsite · School · Solo/Friends). The active tab has a spring-driven moving pill (`layoutId="activeTab"`). It also holds the budget slider, pace control and day and group-size steppers. |
| **Itinerary** | `/` | Pacing-aware Morning/Afternoon/Sunset/Night slot cards. You can drag to reorder or tap the arrows. Transit buffers show between cards, and a pacing meter warns about overloaded days, ghat and cross-region friction (e.g. North ↔ South Goa), missed sunsets, school curfews and budget. Each slot has a Swap/Re-roll option and a *Save Image* button. |
| **Farmhouses & Stays** | `/stays` | Farmhouses, estates, agro-farms, pool villas, jungle lodges, hostels, homestays and havelis. Cards show suitability badges, Wi-Fi Mbps, and cleanliness, food, pool and safety scores. A review drawer shows pros and cons, rooms and rates, contacts, and reviews you can filter by traveller type. You can save properties to a shortlist, and saved stays are printed in the PDF. |
| **Mystery Roulette** | `/roulette` | A 4-question visual quiz scores every destination. Your top 8 go onto a weighted wheel that slows down with an easeOutQuart curve and plays synthesised ticks. The winner is revealed with confetti and a starter 3-day plan. |
| **Food Radar** | `/food` | Staple dishes (veg/non-veg markers, spice level) plus legendary eateries, dhabas and street-food lanes. Destinations without their own guide show regional staples instead. |
| **Transit & Logistics** | `/transit` | Ways to get around with cost ranges, a transit-friction map, a rental and fuel estimator, train and bus tips, scam alerts, and emergency numbers you can tap to call. |
| **Export & Share** | `/export` | One-click A4 PDF built with html2canvas + jsPDF, with a live preview and an `@media print` fallback. It also has WhatsApp-formatted text with 1-tap copy and a high-res photo and wallpaper gallery. |

## Architecture

```
data/                 Typed seed data (no runtime deps)
  destinations.ts     68 destinations · 6 regions · Tier 1/2/3 · zones & transit links
  farmhouses.ts       Farmhouses, estates, agro-farms, jungle lodges (3+ reviews each)
  stays.ts            Hostels, homestays, havelis, boutique hotels (3+ reviews each)
  food.ts             Destination food guides + regional fallbacks
  occasions.ts        Occasion metadata + activity templates per cohort
  regions.ts          Region meta, national emergency numbers, regional transit defaults
  roulette.ts         Quiz + vibe-mapping/scoring + weighted wheel draw
src/lib/
  itinerary.ts        Plan generation, scheduling, pacing analysis, swap options
  destinations.ts     Region-default resolution, directory search & grouping
  images.ts           Unsplash theme resolver, canvas postcard fallback, blob downloads
  audio.ts            Web Audio synth: tick, flip, chime, whoosh… (zero audio files)
  pdfGenerator.ts     html2canvas → jsPDF A4 pipeline (+ print fallback)
  storage.ts          Namespaced, versioned LocalStorage helpers
  share.ts            WhatsApp formatter + clipboard
src/context/TripContext.tsx   Single persisted store (trip, saved stays, wins, mute, theme)
src/components/{layout,itinerary,game,stays,food,logistics,export,ui}
```

### Notes

- **Images.** Photos come from the Unsplash CDN and are chosen by theme keyword. If a photo can't load (offline, blocked or removed), a canvas-drawn postcard replaces it, so cards never show a broken image and downloads still save a real PNG. On iPhone and iPad, *Save to Photos* opens the native share sheet, where you tap "Save Image". Everywhere else, the download uses a blob URL with the `download` attribute.
- **PDF.** The PDF is built from fixed 794×1123 px (A4 @ 96 dpi) pages. They are captured at 2.5× (2× on iOS to stay under Safari's canvas memory limit) and placed full-bleed. Days are paginated by estimated row height, so a page never overflows.
- **Seed data.** Property names, masked phone numbers and reviews are illustrative samples. Well-known eateries are real, but their hours change. Swap in live listings before using this for real bookings.
