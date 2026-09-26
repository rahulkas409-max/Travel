import type { Metadata } from "next";
import { RouletteGame } from "@/components/game/RouletteGame";

export const metadata: Metadata = { title: "Mystery Roulette" };

export default function RoulettePage() {
  return <RouletteGame />;
}
