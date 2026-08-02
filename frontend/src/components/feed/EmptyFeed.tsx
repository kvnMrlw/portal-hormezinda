import { MessageSquareText } from 'lucide-react';

export function EmptyFeed() {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-blue-200/80 bg-portal-surface p-8 text-center shadow-card ring-1 ring-white/80">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-blue-50 text-brand-blue shadow-sm ring-1 ring-blue-100">
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-brand-green ring-4 ring-white" />
        <MessageSquareText className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-brand-navy">
        Ainda n&atilde;o h&aacute; publica&ccedil;&otilde;es.
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Quando professores, dire&ccedil;&atilde;o ou Gr&ecirc;mio compartilharem novidades, elas
        aparecer&atilde;o aqui.
      </p>
    </section>
  );
}
