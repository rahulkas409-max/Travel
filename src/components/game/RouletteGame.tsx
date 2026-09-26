"use client";

import { DESTINATIONS, DESTINATION_BY_ID } from "@data/destinations";
import { OCCASION_BY_ID } from "@data/occasions";
import { pickWheelSegments, scoreDestinations, type MatchResult, type QuizAnswers } from "@data/roulette";
import type { BudgetTier } from "@data/types";
import { AnimatePresence, motion } from "framer-motion";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { destinationSource } from "@/lib/imageSources";
import { DestinationRoulette } from "./DestinationRoulette";
import { RevealModal } from "./RevealModal";
import { VibeQuiz } from "./VibeQuiz";

const BUDGET_VALUE: Record<BudgetTier, number> = { backpacker: 1500, boutique: 4000, luxury: 10000 };

export function RouletteGame() {
  const router = useRouter();
  const { startTrip, addRouletteWin, rouletteWins, clearRouletteWins, toast } = useTrip();
  const [stage, setStage] = useState<"quiz" | "wheel">("quiz");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [segments, setSegments] = useState<MatchResult[]>([]);
  const [winner, setWinner] = useState<MatchResult | null>(null);
  const [spinKey, setSpinKey] = useState(0);

  const occasion = answers.occasion ?? "solo";
  const budget = BUDGET_VALUE[answers.budget ?? "boutique"];

  const onQuizDone = (a: QuizAnswers) => {
    setAnswers(a);
    setSegments(pickWheelSegments(scoreDestinations(a), 8));
    setStage("wheel");
    setSpinKey((k) => k + 1);
  };

  const onResult = (i: number) => {
    const m = segments[i];
    setWinner(m);
    sound.play("chime");
    void celebrate("reveal");
    addRouletteWin({ destinationId: m.destination.id, occasion, percent: m.percent });
  };

  const planIt = (destinationId: string, occ = occasion, b = budget) => {
    sound.play("success");
    startTrip(destinationId, occ, 3, b);
    toast(`🧭 3-day ${DESTINATION_BY_ID[destinationId]?.name} plan ready!`, "success");
    setWinner(null);
    router.push("/itinerary");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Mystery Roulette"
        title={stage === "quiz" ? "Can't decide? Let fate pick." : "Your 8 best-fit circuits"}
        actions={
          stage === "wheel" && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                sound.play("tick");
                setStage("quiz");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Retake quiz
            </button>
          )
        }
      >
        {stage === "quiz"
          ? `Four quick vibe questions. We score all ${DESTINATIONS.length} destinations, load your top 8 onto the wheel and spin — better matches get bigger odds.`
          : "The wheel is weighted toward your strongest matches — but anything can happen."}
      </PageHeader>

      <AnimatePresence mode="wait">
        {stage === "quiz" ? (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <VibeQuiz initial={answers} onComplete={onQuizDone} />
          </motion.div>
        ) : (
          <motion.div key="wheel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
            <DestinationRoulette key={spinKey} segments={segments} onResult={onResult} autoSpin={false} />
            <div className="glass p-4">
              <p className="text-sm font-semibold">On the wheel</p>
              <ul className="mt-2 space-y-1.5">
                {[...segments]
                  .sort((a, b) => b.percent - a.percent)
                  .map((s) => (
                    <li key={s.destination.id} className="flex items-center gap-2 text-sm">
                      <SmartImage source={destinationSource(s.destination)} width={120} className="h-8 w-8 shrink-0 rounded-lg" />
                      <span className="min-w-0 flex-1 truncate">{s.destination.name}</span>
                      <span className="text-xs font-bold tabular-nums text-sage-600 dark:text-sage-300">{s.percent}%</span>
                    </li>
                  ))}
              </ul>
              <p className="muted mt-3 text-xs">
                {OCCASION_BY_ID[occasion].emoji} {OCCASION_BY_ID[occasion].short} · {answers.landscape} · {answers.rhythm} · {answers.budget}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {rouletteWins.length > 0 && (
        <section className="mt-12">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <History className="h-5 w-5 text-marigold-500" /> Past spins
            </h2>
            <button type="button" onClick={clearRouletteWins} className="muted inline-flex items-center gap-1 text-xs hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {rouletteWins.map((w) => {
              const d = DESTINATION_BY_ID[w.destinationId];
              if (!d) return null;
              return (
                <button key={w.id} type="button" onClick={() => planIt(d.id, w.occasion)} className="glass w-44 shrink-0 overflow-hidden text-left transition hover:-translate-y-0.5">
                  <SmartImage source={destinationSource(d)} width={360} className="h-24 w-full" />
                  <div className="p-2.5">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    <p className="muted text-[11px]">
                      {OCCASION_BY_ID[w.occasion].emoji} {w.percent}% · {new Date(w.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">Plan it →</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <RevealModal
        match={winner}
        occasion={occasion}
        budget={budget}
        onClose={() => setWinner(null)}
        onPlan={() => winner && planIt(winner.destination.id)}
        onSpinAgain={() => {
          setWinner(null);
          setSegments(pickWheelSegments(scoreDestinations(answers), 8));
          setSpinKey((k) => k + 1);
        }}
      />
    </div>
  );
}
