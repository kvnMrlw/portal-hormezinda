import type { ReactNode } from 'react';

type ModuleHeaderProps = {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function ModuleHeader({ action, description, eyebrow, title }: ModuleHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-950/5 bg-portal-surface p-6 shadow-card ring-1 ring-white/80 sm:p-7">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-blue">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-brand-navy sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
