import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/money/LegalPage";
import { BUSINESS } from "@/config/business";

export const metadata: Metadata = { title: "Privacy notice" };

export default function Page() {
  return (
    <LegalPage title="Privacy notice" updated="September 2026">
      <p>
        This notice explains how {BUSINESS.legalName} (“{BUSINESS.name}”, the <b>Data Fiduciary</b>) processes personal data under the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information
        Technology Act, 2000 and rules made under them.
      </p>

      <h2>1. Planning without an account</h2>
      <p>You can use every planning feature without signing up. Itineraries, saved stays, roulette results and Organiser Pro branding are stored only in your own browser (LocalStorage) — we never receive them.</p>

      <h2>2. What we collect, and why</h2>
      <ul>
        <li><b>Quote requests</b> — name, phone/WhatsApp, optional email, trip details. Purpose: to send you quotes and share your request with up to three relevant properties or operators.</li>
        <li><b>Property listings</b> — owner name, contact and property details. Purpose: to verify and publish the listing.</li>
        <li><b>Payments</b> — the payment reference you send us. Purpose: to activate a plan and meet accounting and tax obligations. Card/UPI details are handled by your bank, UPI app or Razorpay; we never see them.</li>
        <li><b>Grievances and data requests</b> — the details you submit. Purpose: to respond and keep a record of the resolution.</li>
      </ul>
      <p>We collect only what these purposes need, do not sell personal data, and use no advertising trackers or third-party cookies.</p>

      <h2>3. Consent</h2>
      <p>We process personal data on the basis of your consent, given by ticking the (unticked-by-default) consent box on each form. You may withdraw consent at any time, as easily as you gave it, using the <Link href="/contact?topic=withdraw-consent">withdraw-consent form</Link>. Withdrawal does not affect processing already done.</p>

      <h2>4. Children</h2>
      <p>Our forms are meant for adults (18+). We do not knowingly collect children&apos;s personal data. School organisers should not submit students&apos; details to us; the Organiser Pro roster is a blank printable page kept on your own device.</p>

      <h2>5. Sharing</h2>
      <ul>
        <li>With up to three properties/operators you asked quotes for (only the details needed to quote).</li>
        <li>With our service providers acting on our instructions (e.g. hosting on Vercel, a spreadsheet/database for storing requests).</li>
        <li>When required by law or a lawful request from a government authority.</li>
      </ul>

      <h2>6. Retention</h2>
      <p>Quote requests are deleted 12 months after your trip date; listing records while the listing is active plus 12 months; payment records for the period required by tax law (generally 8 years). Grievance records are kept for 3 years.</p>

      <h2>7. Your rights</h2>
      <ul>
        <li>Access a summary of your personal data and how it is processed.</li>
        <li>Correction, completion, updating and erasure of your data.</li>
        <li>Grievance redressal, and nominating a person to exercise your rights in case of death or incapacity.</li>
      </ul>
      <p>
        Use the <Link href="/contact?topic=data-access">data-rights request form</Link>. We respond within 30 days.
      </p>

      <h2>8. Security & breaches</h2>
      <p>Data is transmitted over HTTPS and stored with access controls. If a personal-data breach occurs, we will inform affected users and the Data Protection Board of India as the law requires.</p>

      <h2>9. Third-party content</h2>
      <p>Photos and summaries load from Wikipedia, Wikivoyage and Wikimedia Commons, and weather from Open-Meteo; your browser contacts these services directly. Partner links open websites that have their own privacy policies.</p>

      <h2>10. Grievance Officer</h2>
      <p>
        {BUSINESS.grievanceOfficer ?? "Grievance Officer"}
        {BUSINESS.grievanceEmail ? ` — ${BUSINESS.grievanceEmail}` : ""}
        {BUSINESS.address ? `, ${BUSINESS.address}` : ""}. We acknowledge complaints within 48 hours and resolve them within 30 days. If you are not satisfied, you may complain to the Data Protection Board of India.
      </p>
    </LegalPage>
  );
}
