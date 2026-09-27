import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactPage } from "@/components/money/ContactPage";

export const metadata: Metadata = {
  title: "Contact & grievance redressal",
  description: "Contact RoamIndia, raise a complaint, or exercise your data rights (access, correction, erasure, withdrawal of consent).",
};

export default function Page() {
  return (
    <Suspense>
      <ContactPage />
    </Suspense>
  );
}
