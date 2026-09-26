import { DESTINATIONS, DESTINATION_BY_ID } from "@data/destinations";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationDetail } from "@/components/explore/DestinationDetail";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = DESTINATION_BY_ID[id];
  if (!d) return {};
  return {
    title: `${d.name} travel guide & itinerary`,
    description: `${d.tagline}. Best time: ${d.idealMonths}. Plans for couples, office offsites, school trips and friends — stays, food, transit and live weather.`,
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!DESTINATION_BY_ID[id]) notFound();
  return <DestinationDetail id={id} />;
}
