import type { Metadata } from "next";
import { Suspense } from "react";
import { PartnerPage } from "@/components/money/PartnerPage";

export const metadata: Metadata = {
  title: "List your farmhouse, homestay or resort",
  description: "List free on RoamIndia. Get verified, get featured, or receive group enquiries from offsites and school trips — at a fraction of typical portal commissions.",
};

export default function Page() {
  return (
    <Suspense>
      <PartnerPage />
    </Suspense>
  );
}
