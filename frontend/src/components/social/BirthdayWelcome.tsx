import { Gift, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { getTodayBirthdays } from '../../services/social';
import { Button } from '../ui/Button';

const birthdayStoragePrefix = 'portal_hormezinda_birthday_seen';

function birthdayKey(userId: string): string {
  return `${birthdayStoragePrefix}_${userId}`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BirthdayWelcome() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const storageKey = useMemo(() => (user ? birthdayKey(user.id) : ''), [user]);

  useEffect(() => {
    async function loadBirthday() {
      if (!user || !storageKey) return;

      const birthdays = await getTodayBirthdays();
      const alreadySeen = localStorage.getItem(storageKey) === todayKey();

      if (birthdays.meuAniversario && !alreadySeen) {
        setIsOpen(true);
        setShowConfetti(true);
        localStorage.setItem(storageKey, todayKey());
        window.setTimeout(() => setShowConfetti(false), 3600);
      }
    }

    void loadBirthday().catch(() => undefined);
  }, [storageKey, user]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4">
      {showConfetti ? <Confetti /> : null}
      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 text-center shadow-soft">
        <button
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <Gift className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-normal text-brand-navy">
          Feliz aniversário!
        </h2>
        <p className="mt-3 text-base font-medium leading-7 text-slate-600">
          🎉 Feliz aniversário! A equipe do Portal Hormezinda deseja um excelente dia!
        </p>
        <Button className="mt-6" onClick={() => setIsOpen(false)} type="button">
          Obrigado
        </Button>
      </section>
    </div>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 42 }).map((_, index) => (
        <span
          className="birthday-confetti absolute top-[-1rem] h-3 w-2 rounded-sm"
          key={index}
          style={{
            animationDelay: `${(index % 12) * 0.12}s`,
            backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#e11d48', '#7c3aed'][index % 5],
            left: `${(index * 37) % 100}%`,
          }}
        />
      ))}
    </div>
  );
}
