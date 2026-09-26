import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-1 font-display text-4xl font-bold">{title}</h1>
      <p className="muted mt-1 text-sm">Last updated {updated}</p>
      <div className="glass mt-6 space-y-4 p-6 text-[15px] leading-relaxed [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
      <p className="muted mt-4 text-xs">This is a plain-language template. Have it reviewed by a qualified professional for your business before relying on it.</p>
    </article>
  );
}
