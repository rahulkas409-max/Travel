import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Off the map</h1>
      <p className="muted mt-2">This trail doesn&apos;t exist — but plenty of others do.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to your itinerary
      </Link>
    </div>
  );
}
