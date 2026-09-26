import type { Metadata } from "next";
import { FoodRadar } from "@/components/food/FoodRadar";

export const metadata: Metadata = { title: "Local Food & Radar" };

export default function FoodPage() {
  return <FoodRadar />;
}
