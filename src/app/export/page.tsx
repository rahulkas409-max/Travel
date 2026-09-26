import type { Metadata } from "next";
import { ExportHub } from "@/components/export/ExportHub";

export const metadata: Metadata = { title: "Export & Share" };

export default function ExportPage() {
  return <ExportHub />;
}
