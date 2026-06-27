import { MessageSquareText } from 'lucide-react';

export function EmptyFeed() {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
        <MessageSquareText className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-brand-navy">Ainda n&atilde;o h&aacute; publica&ccedil;&otilde;es.</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Quando professores, dire&ccedil;&atilde;o ou Gr&ecirc;mio compartilharem novidades, elas aparecer&atilde;o aqui.
      </p>
    </section>
  );
}
