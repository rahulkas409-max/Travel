import type { Metadata } from "next";
import { PricingPage } from "@/components/money/PricingPage";

export const metadata: Metadata = {
  title: "Pricing — free for travellers, fair for businesses",
  description: "RoamIndia is free for travellers. Properties and organisers pay tiny, transparent fees — a fraction of typical booking-portal commissions.",
};

export default function Page() {
  return <PricingPage />;
}
