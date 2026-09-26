import type { ReactNode } from "react";
import { DestinationChip } from "./DestinationChip";

export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
  destination = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Show the in-page destination switcher under the title. */
  destination?: boolean;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
        {destination && <DestinationChip className="mt-3" />}
        {children && <div className="muted mt-2 max-w-2xl text-sm sm:text-base">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
