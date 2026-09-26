/** canvas-confetti bursts in the RoamIndia palette (lazy-loaded, reduced-motion aware). */

const COLORS = ["#f59e0b", "#e06d53", "#588157", "#fde68a", "#faf7f2"];

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export async function celebrate(kind: "reveal" | "export" | "small" = "reveal") {
  if (typeof window === "undefined" || reducedMotion()) return;
  const { default: confetti } = await import("canvas-confetti");
  if (kind === "small") {
    void confetti({ particleCount: 40, spread: 60, startVelocity: 28, origin: { y: 0.7 }, colors: COLORS, scalar: 0.8 });
    return;
  }
  if (kind === "export") {
    void confetti({ particleCount: 90, spread: 100, origin: { y: 0.8 }, colors: COLORS });
    return;
  }
  const end = Date.now() + 1200;
  const frame = () => {
    void confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors: COLORS });
    void confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  void confetti({ particleCount: 140, spread: 90, startVelocity: 45, origin: { y: 0.55 }, colors: COLORS, shapes: ["circle", "square"] });
  frame();
}
