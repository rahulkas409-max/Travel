import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/money/LegalPage";
import { BUSINESS, PLANS } from "@/config/business";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <LegalPage title="Terms of use" updated="September 2026">
      <p>
        These terms govern your use of {BUSINESS.name}, operated by {BUSINESS.legalName}. By using the site you agree to them. {BUSINESS.name} provides free trip-planning information; itineraries, timings,
        prices, permits and weather are guidance only — always confirm with operators and official sources before travelling.
      </p>
      <h2>1. Our role</h2>
      <ul>
        <li>We are a planning and discovery platform. Bookings made on partner websites are contracts between you and that partner, under the partner&apos;s terms.</li>
        <li>Property listings and reviews marked “Sample” are illustrative. Paid placements are always labelled “Sponsored”. Ratings are never for sale.</li>
      </ul>
      <h2>2. Prices & payments</h2>
      <ul>
        <li>All prices are in Indian Rupees and are the final price inclusive of all applicable taxes — no hidden or drip charges are added at checkout.</li>
        <li>Organiser Pro: ₹{PLANS.proTrip.price} per trip (valid 60 days) or ₹{PLANS.proYear.price} per year, for the purchasing organisation only.</li>
        <li>Listings: free, Verified ₹{PLANS.verified.price}/month, Featured ₹{PLANS.featured.price}/month. Group enquiries: ₹{PLANS.lead.price} per delivered enquiry or the agreed success fee.</li>
        <li>
          Cancellations and refunds: see the <Link href="/refunds">refund policy</Link>.
        </li>
      </ul>
      <h2>3. Properties & partners</h2>
      <ul>
        <li>You must be authorised to list a property, keep details and prices accurate, and hold the licences required locally. We may remove misleading listings.</li>
        <li>You must not post fake reviews or pay for reviews (see BIS IS 19000:2022 and the Consumer Protection Act, 2019).</li>
      </ul>
      <h2>4. Acceptable use</h2>
      <p>Do not misuse the site, scrape it at scale, submit false information, or upload unlawful content. We may block abusive traffic.</p>
      <h2>5. Content & licences</h2>
      <p>Open-licensed photos and text are credited to their authors under their licences (e.g. CC BY-SA 4.0). Report copyright concerns via the <Link href="/contact?topic=content">contact form</Link>; we act on valid notices promptly.</p>
      <h2>6. Liability</h2>
      <p>To the extent permitted by law, we are not liable for losses arising from partner services, travel disruptions, weather or reliance on guidance information. Nothing here limits your rights under the Consumer Protection Act, 2019.</p>
      <h2>7. Grievances, law & jurisdiction</h2>
      <p>
        Raise concerns via our <Link href="/contact">Grievance Officer</Link> (acknowledged within 48 hours, resolved within 30 days). These terms are governed by the laws of India; courts at {BUSINESS.jurisdiction} have
        jurisdiction, without prejudice to consumer forums available to you.
      </p>
    </LegalPage>
  );
}
