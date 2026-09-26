import type { Metadata } from "next";
import { Suspense } from "react";
import { StaysExplorer } from "@/components/stays/StaysExplorer";

export const metadata: Metadata = { title: "Farmhouses & Stays" };

export default function StaysPage() {
  return (
    <Suspense>
      <StaysExplorer />
    </Suspense>
  );
}
