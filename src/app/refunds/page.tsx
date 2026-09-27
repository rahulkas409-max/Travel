import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/money/LegalPage";
import { BUSINESS, PLANS } from "@/config/business";

export const metadata: Metadata = { title: "Cancellation & refund policy" };

export default function Page() {
  return (
    <LegalPage title="Cancellation & refund policy" updated="September 2026">
      <p>
        {BUSINESS.name} does not sell hotel rooms, tickets or transport. Bookings made through partner links (for example Booking.com, GetYourGuide or Klook) follow that partner&apos;s cancellation and
        refund policy. This page covers only payments made to {BUSINESS.legalName}.
      </p>
      <h2>Organiser Pro</h2>
      <ul>
        <li>Single trip (₹{PLANS.proTrip.price}) and yearly (₹{PLANS.proYear.price}) plans are digital services activated by an access code.</li>
        <li>Full refund if you request it within 7 days of payment and have not unlocked the code, or if the code does not work and we cannot fix it.</li>
      </ul>
      <h2>Verified & Featured listings</h2>
      <ul>
        <li>Billed monthly (₹{PLANS.verified.price} / ₹{PLANS.featured.price}). Cancel anytime — the plan stops at the end of the paid month; no auto-debit is set up without your separate mandate.</li>
        <li>If we cannot publish your listing (e.g. verification fails), the month&apos;s fee is refunded in full.</li>
      </ul>
      <h2>Group-enquiry fees</h2>
      <ul>
        <li>Charged only for enquiries delivered to you. Duplicate or clearly fake enquiries are credited back on request within 14 days.</li>
      </ul>
      <h2>Voluntary support</h2>
      <ul>
        <li>“Support RoamIndia” contributions are voluntary; we refund any accidental duplicate payment on request.</li>
      </ul>
      <h2>How refunds are paid</h2>
      <p>Approved refunds are paid to the original UPI / payment method within 7 working days. Prices shown are final and inclusive of all applicable taxes; there are no hidden charges.</p>
      <p>
        To request a cancellation or refund, use the <Link href="/contact?topic=payment">contact & grievance form</Link> with your payment reference.
      </p>
    </LegalPage>
  );
}
