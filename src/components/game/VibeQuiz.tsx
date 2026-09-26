"use client";

import { QUIZ, type QuizAnswers, type QuizKey } from "@data/roulette";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { sound } from "@/lib/audio";
import { cn } from "@/lib/format";

/** 4-step visual vibe quiz with tactile flip-cards. */
export function VibeQuiz({ initial, onComplete }: { initial?: QuizAnswers; onComplete: (a: QuizAnswers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(initial ?? {});
  const [picked, setPicked] = useState<string | null>(null);
  const q = QUIZ[step];

  const choose = (key: QuizKey, value: string) => {
    if (picked) return;
    sound.unlock();
    sound.play("flip");
    setPicked(value);
    const next = { ...answers, [key]: value } as QuizAnswers;
    setAnswers(next);
    setTimeout(() => {
      setPicked(null);
      if (step === QUIZ.length - 1) {
        sound.play("success");
        onComplete(next);
      } else {
        setStep((s) => s + 1);
      }
    }, 520);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            sound.play("tick");
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          className="icon-btn disabled:opacity-30"
          aria-label="Previous question"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 gap-1.5" aria-label={`Question ${step + 1} of ${QUIZ.length}`}>
          {QUIZ.map((_, i) => (
            <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-marigold-500 to-rose-500" initial={false} animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
          ))}
        </div>
        <span className="text-sm font-bold tabular-nums">
          {step + 1}/{QUIZ.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.key} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{q.title}</h2>
          <p className="muted mt-1">{q.subtitle}</p>
          <div className={cn("mt-6 grid gap-3", q.options.length === 3 ? "sm:grid-cols-3" : "grid-cols-2")} style={{ perspective: 1000 }}>
            {q.options.map((o, i) => {
              const isPicked = picked === o.value;
              const wasChosen = answers[q.key] === o.value && !picked;
              return (
                <motion.button
                  key={o.value}
                  type="button"
                  onClick={() => choose(q.key, o.value)}
                  initial={{ opacity: 0, y: 20, rotateX: -15 }}
                  animate={{ opacity: picked && !isPicked ? 0.45 : 1, y: 0, rotateX: 0, rotateY: isPicked ? 360 : 0, scale: isPicked ? 1.04 : 1 }}
                  transition={{ delay: picked ? 0 : i * 0.06, rotateY: { duration: 0.5, ease: "easeInOut" } }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl text-left shadow-card outline-none",
                    q.options.length === 3 ? "aspect-[4/3] sm:aspect-[3/4]" : "aspect-[4/5] sm:aspect-[4/3]",
                    (isPicked || wasChosen) && "ring-4 ring-rose-500",
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <SmartImage imageKey={o.imageKey} label={o.label} seed={o.value} width={600} className="absolute inset-0 h-full w-full" imgClassName="transition duration-500 group-hover:scale-105" />
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-multiply", o.gradient)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span className="text-3xl drop-shadow sm:text-4xl">{o.emoji}</span>
                    <p className="mt-1 font-display text-lg font-semibold leading-tight sm:text-xl">{o.label}</p>
                    <p className="text-xs text-white/80 sm:text-sm">{o.hint}</p>
                  </div>
                  {(isPicked || wasChosen) && (
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
