import type { ReactNode } from 'react';

type ModuleHeaderProps = {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function ModuleHeader({ action, description, eyebrow, title }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
