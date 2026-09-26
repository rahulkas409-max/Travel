import type { Metadata } from "next";
import { ProPage } from "@/components/money/ProPage";

export const metadata: Metadata = { title: "Organiser Pro — branded trip dossiers for schools & teams" };

export default function Page() {
  return <ProPage />;
}
