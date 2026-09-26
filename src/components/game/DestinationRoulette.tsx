"use client";

import { drawWinner, type MatchResult } from "@data/roulette";
import { motion } from "framer-motion";
import { Dices } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sound } from "@/lib/audio";

const COLORS = ["#f59e0b", "#e06d53", "#588157", "#d97706", "#c9553c", "#466a45", "#fbbf24", "#e98670"];
const SIZE = 340;
const R = SIZE / 2;

/** Physics-y decelerating wheel: easeOutQuart, per-peg ticks, pointer flap, haptics. */
export function DestinationRoulette({ segments, onResult, autoSpin = false }: { segments: MatchResult[]; onResult: (index: number) => void; autoSpin?: boolean }) {
  const wheelRef = useRef<SVGGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const raf = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const n = segments.length;
  const seg = 360 / n;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const flap = () => {
    const p = pointerRef.current;
    if (!p) return;
    p.animate([{ transform: "translateX(-50%) rotate(-22deg)" }, { transform: "translateX(-50%) rotate(0deg)" }], { duration: 140, easing: "ease-out" });
  };

  const spin = useCallback(() => {
    if (spinning || n === 0) return;
    sound.unlock();
    sound.play("whoosh");
    setSpinning(true);
    const winner = drawWinner(segments);
    const start = rotation.current;
    const center = (winner + 0.5) * seg;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const base = start - (start % 360);
    const target = base + 360 * (6 + Math.floor(Math.random() * 2)) + (360 - center) + jitter;
    const duration = 5600 + Math.random() * 900;
    const t0 = performance.now();
    let lastPeg = Math.floor(start / seg);

    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      // easeOutQuart with a tiny overshoot-free settle — feels like friction.
      const eased = 1 - Math.pow(1 - t, 4);
      const rot = start + (target - start) * eased;
      rotation.current = rot;
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${rot}deg)`;
      const peg = Math.floor(rot / seg);
      if (peg !== lastPeg) {
        lastPeg = peg;
        const speed = 1 - t;
        sound.play("tick", { intensity: 0.5 + speed * 0.6 });
        flap();
        if (typeof navigator !== "undefined" && "vibrate" in navigator && speed > 0.1) navigator.vibrate?.(4);
      }
      if (t < 1) raf.current = requestAnimationFrame(frame);
      else {
        setSpinning(false);
        setTimeout(() => onResult(winner), 350);
      }
    };
    raf.current = requestAnimationFrame(frame);
  }, [spinning, n, seg, segments, onResult]);

  useEffect(() => {
    if (autoSpin) {
      const t = setTimeout(spin, 450);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: "min(88vw, 400px)", aspectRatio: "1" }}>
        {/* Pointer */}
        <div ref={pointerRef} className="absolute left-1/2 top-[-6px] z-10 origin-top" style={{ transform: "translateX(-50%)" }}>
          <svg width="34" height="44" viewBox="0 0 34 44" aria-hidden>
            <path d="M17 44 L3 10 A15 15 0 1 1 31 10 Z" fill="#0b0f19" stroke="#faf7f2" strokeWidth="3" />
            <circle cx="17" cy="15" r="5" fill="#f59e0b" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-marigold-400 to-rose-500 p-2 shadow-[0_30px_80px_-20px_rgba(224,109,83,0.6)]">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full rounded-full bg-sand-100">
            <g ref={wheelRef} style={{ transformOrigin: `${R}px ${R}px`, transform: `rotate(${rotation.current}deg)` }}>
              {segments.map((s, i) => {
                const a0 = ((i * seg - 90) * Math.PI) / 180;
                const a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
                const x0 = R + R * Math.cos(a0);
                const y0 = R + R * Math.sin(a0);
                const x1 = R + R * Math.cos(a1);
                const y1 = R + R * Math.sin(a1);
                const mid = (i + 0.5) * seg;
                const name = s.destination.name.length > 14 ? `${s.destination.name.slice(0, 13)}…` : s.destination.name;
                return (
                  <g key={s.destination.id}>
                    <path d={`M${R},${R} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`} fill={COLORS[i % COLORS.length]} stroke="#faf7f2" strokeWidth="2" />
                    <g transform={`rotate(${mid} ${R} ${R})`}>
                      <text x={R} y={78} textAnchor="middle" fill="#fff" fontSize="11.5" fontWeight="700" style={{ fontFamily: "system-ui, sans-serif" }} transform={`rotate(90 ${R} 78)`} dominantBaseline="middle">
                        <tspan>{name}</tspan>
                      </text>
                    </g>
                    <circle cx={R + (R - 7) * Math.cos(a0)} cy={R + (R - 7) * Math.sin(a0)} r="3.5" fill="#faf7f2" />
                  </g>
                );
              })}
            </g>
            <circle cx={R} cy={R} r="44" fill="#0b0f19" />
            <circle cx={R} cy={R} r="38" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 5" />
          </svg>
        </div>
        <motion.button
          type="button"
          onClick={spin}
          disabled={spinning}
          whileTap={{ scale: 0.92 }}
          className="absolute left-1/2 top-1/2 z-10 flex h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full font-display text-sm font-bold text-marigold-400 disabled:cursor-wait"
          aria-label="Spin the wheel"
        >
          <Dices className="h-6 w-6" />
          {spinning ? "…" : "SPIN"}
        </motion.button>
      </div>
      <button type="button" onClick={spin} disabled={spinning} className="btn-primary mt-6 w-full max-w-xs text-base">
        <Dices className="h-5 w-5" /> {spinning ? "Spinning…" : "Spin the wheel"}
      </button>
    </div>
  );
}
