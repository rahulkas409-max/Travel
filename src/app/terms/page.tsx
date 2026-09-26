import type { Metadata } from "next";
import { LegalPage } from "@/components/money/LegalPage";
import { BUSINESS, PLANS } from "@/config/business";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <LegalPage title="Terms of use" updated="September 2026">
      <p>{BUSINESS.name} provides free trip-planning tools for travellers. Itineraries, timings, prices and permits are guidance only — always confirm with operators before travelling.</p>
      <h2>Travellers</h2>
      <ul>
        <li>Planning features are free. Bookings made on partner websites are contracts between you and that partner.</li>
        <li>Quote requests are free; you are under no obligation to book.</li>
      </ul>
      <h2>Organiser Pro</h2>
      <ul>
        <li>Pro is sold per trip (₹{PLANS.proTrip.price}, valid 60 days) or yearly (₹{PLANS.proYear.price}). Codes are for the purchasing organisation only.</li>
        <li>If a code does not work, contact us within 7 days of purchase for a replacement or refund.</li>
      </ul>
      <h2>Properties</h2>
      <ul>
        <li>Listings must be accurate and you must be authorised to list the property. We may remove listings that mislead travellers.</li>
        <li>Verified (₹{PLANS.verified.price}/month) and Featured (₹{PLANS.featured.price}/month) plans are billed monthly and can be stopped anytime. Featured placements are labelled “Sponsored”.</li>
        <li>Group-enquiry fees apply only to enquiries delivered to you; success fees only to confirmed bookings.</li>
        <li>Payment never influences ratings, reviews or roulette results.</li>
      </ul>
      <h2>Content</h2>
      <p>Open-licensed photos and text are credited to their authors under their licences (e.g. CC BY-SA). Sample reviews shown in the app are illustrative and marked as such.</p>
    </LegalPage>
  );
}
