import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { SchoolLogo } from '../ui/SchoolLogo';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

// Layout responsivo das paginas de login e cadastro.
export function AuthLayout({ children, subtitle, title }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f3f6fb] px-5 py-6 text-brand-navy">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft ring-1 ring-slate-950/5">
            <SchoolLogo />
          </div>
          <span className="text-lg font-semibold">Portal Hormezinda</span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.section
            animate={{ y: 0 }}
            className="max-w-xl text-brand-navy"
            initial={{ y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
              Acesso escolar
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-brand-navy sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{subtitle}</p>
          </motion.section>

          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
