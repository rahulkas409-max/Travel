import type { Metadata } from "next";
import { Suspense } from "react";
import { DestinationsIndex } from "@/components/explore/DestinationsIndex";

export const metadata: Metadata = {
  title: "Destinations across India",
  description: "68 destinations across North, West, South, East, Central and Northeast India — metros, classics and off-beat Tier 3 escapes.",
};

export default function DestinationsPage() {
  return (
    <Suspense>
      <DestinationsIndex />
    </Suspense>
  );
}
