import type { Property, Review, TravellerTag } from "./types";

/** Compact review author: R(author, from, tag, rating, "Mon YYYY", title, body, verified?) */
export function R(
  author: string,
  from: string,
  tag: TravellerTag,
  rating: number,
  date: string,
  title: string,
  body: string,
  verified = false,
): Omit<Review, "id"> {
  return { author, from, tag, rating, date, title, body, verified };
}

type PropertyDraft = Omit<Property, "reviews"> & { reviews: Omit<Review, "id">[] };

export function withReviewIds(p: PropertyDraft): Property {
  return { ...p, reviews: p.reviews.map((r, i) => ({ ...r, id: `${p.id}-r${i + 1}` })) };
}
