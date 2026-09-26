import type { Metadata } from "next";
import { TimelineView } from "@/components/itinerary/TimelineView";

export const metadata: Metadata = { title: "Itinerary Planner" };

export default function ItineraryPage() {
  return <TimelineView />;
}
