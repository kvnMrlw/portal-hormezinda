import { Loader2, SendHorizonal } from 'lucide-react';
import type { FormEvent } from 'react';
import { memo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

type CreatePostProps = {
  error?: string;
  isSubmitting: boolean;
  onCreate: (text: string) => Promise<void>;
};

export const CreatePost = memo(function CreatePost({ error, isSubmitting, onCreate }: CreatePostProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const remaining = 1000 - text.length;
  const isDisabled = text.trim().length === 0 || remaining < 0 || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    await onCreate(text);
    setText('');
  }

  return (
    <form
      className="rounded-[1.75rem] border border-white bg-white/95 p-4 shadow-sm transition duration-300 focus-within:shadow-soft sm:p-5"
      onSubmit={handleSubmit}
    >
      <div className="flex gap-3">
        <Avatar className="h-11 w-11 shrink-0 ring-4 ring-blue-50" name={user?.nomeCompleto} src={user?.fotoPerfil} />
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="create-feed-post">
            No que voce esta pensando hoje?
          </label>
          <textarea
            className="min-h-24 w-full resize-none rounded-3xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-base text-brand-navy outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100"
            id="create-feed-post"
            maxLength={1100}
            onChange={(event) => setText(event.target.value)}
            placeholder="No que voce esta pensando hoje?"
            value={text}
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span
              className={cn(
                'text-xs font-medium',
                remaining < 0 ? 'text-red-600' : remaining <= 120 ? 'text-amber-600' : 'text-slate-400'
              )}
            >
              {remaining} caracteres restantes
            </span>
            <Button className="h-11 rounded-full px-5" disabled={isDisabled} type="submit">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              Publicar
            </Button>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
        </div>
      </div>
    </form>
  );
});
