import type { Metadata } from "next";
import { LegalPage } from "@/components/money/LegalPage";
import { BUSINESS } from "@/config/business";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <LegalPage title="Privacy policy" updated="September 2026">
      <p>{BUSINESS.name} is built to work without an account. Your itineraries, saved stays, roulette results and Pro branding are stored only in your browser (LocalStorage) and never uploaded.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Only when you submit a quote request, property listing or payment reference: your name, phone/WhatsApp, optional email and trip details you enter.</li>
        <li>No advertising trackers or third-party cookies.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To send you quotes and share your request with up to three relevant properties or operators.</li>
        <li>To activate paid plans and issue access codes.</li>
      </ul>
      <h2>Third-party services</h2>
      <ul>
        <li>Photos and descriptions load from Wikipedia / Wikimedia Commons; weather from Open-Meteo. These services receive a standard web request from your browser.</li>
        <li>Booking links open partner websites (e.g. Booking.com, GetYourGuide, Klook) under their own privacy policies.</li>
        <li>Payments are handled by your UPI app or Razorpay; we never see card details.</li>
      </ul>
      <h2>Your choices</h2>
      <p>Clear all on-device data anytime via “Clear my data” in the footer. To delete a request you submitted, contact us{BUSINESS.email ? ` at ${BUSINESS.email}` : ""}.</p>
    </LegalPage>
  );
}
