import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--nf-sans", display: "swap" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--nf-display", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: {
    default: "RoamIndia — Free Personalised India Itinerary Builder",
    template: "%s · RoamIndia",
  },
  description:
    "Plan romantic getaways, office offsites, school trips and solo adventures across India — pacing-aware itineraries, farmhouse & stay reviews, food radar, transit tips, surprise roulette and one-click A4 PDF export. 100% free, no login.",
  applicationName: "RoamIndia",
  appleWebApp: { capable: true, title: "RoamIndia", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf7f2",
};

/** Applies the saved theme before first paint to avoid a light/dark flash. */
const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem('roamindia:v1:theme')||'"system"');var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
