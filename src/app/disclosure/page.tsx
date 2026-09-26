import type { Metadata } from "next";
import { LegalPage } from "@/components/money/LegalPage";

export const metadata: Metadata = { title: "How RoamIndia makes money" };

export default function Page() {
  return (
    <LegalPage title="How we make money" updated="September 2026">
      <p>We keep planning free by earning in a few transparent ways. None of them changes what you pay.</p>
      <ul>
        <li><b>Partner links:</b> some booking and ticket links (e.g. Booking.com, GetYourGuide, Klook) are affiliate links. If you book, the partner may pay us a small commission — your price is the same.</li>
        <li><b>Sponsored listings:</b> properties can pay to be Verified or Featured. Featured placements are always labelled “Sponsored”.</li>
        <li><b>Group enquiries:</b> when you request quotes, the properties that receive your request may pay us a small fee. You never pay for quotes.</li>
        <li><b>Organiser Pro:</b> schools, companies and agents can buy branded dossiers and group tools.</li>
      </ul>
      <p>Ratings, rankings of experiences and the roulette wheel are never for sale.</p>
    </LegalPage>
  );
}
