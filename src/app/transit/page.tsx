import type { Metadata } from "next";
import { TransitGuide } from "@/components/logistics/TransitGuide";

export const metadata: Metadata = { title: "Transit & Logistics" };

export default function TransitPage() {
  return <TransitGuide />;
}
