import { ImagePlus, Loader2, Newspaper, Palette, Plus, SendHorizonal } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import type { CreatePostPayload, CreateStoryPayload } from '../../types/feed';
import { StoryKind } from '../../types/feed';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getAssetUrl } from './feedUtils';

type CreateMode = 'choice' | 'post' | 'story';

type CreateContentModalProps = {
  error?: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreatePost: (payload: CreatePostPayload) => Promise<void>;
  onCreateStory: (payload: CreateStoryPayload) => Promise<void>;
};

const maxImageSize = 5 * 1024 * 1024;

export function CreateContentModal({
  error,
  isOpen,
  isSubmitting,
  onClose,
  onCreatePost,
  onCreateStory
}: CreateContentModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<CreateMode>('choice');
  const [text, setText] = useState('');
  const [storyBackground, setStoryBackground] = useState('#2563eb');
  const [image, setImage] = useState<File>();
  const [localError, setLocalError] = useState<string>();

  useEffect(() => {
    if (!isOpen) {
      setMode('choice');
      setText('');
      setImage(undefined);
      setLocalError(undefined);
      setStoryBackground('#2563eb');
    }
  }, [isOpen]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(undefined);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setLocalError('Selecione uma imagem valida.');
      return;
    }

    if (file.size > maxImageSize) {
      setLocalError('A imagem deve ter no maximo 5MB.');
      return;
    }

    setLocalError(undefined);
    setImage(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText && !image) {
      setLocalError('Inclua texto ou imagem para continuar.');
      return;
    }

    if (mode === 'post') {
      await onCreatePost({ texto: trimmedText, imagem: image });
    }

    if (mode === 'story') {
      await onCreateStory({
        tipo: image ? StoryKind.IMAGE : StoryKind.TEXT,
        texto: trimmedText,
        fundo: storyBackground,
        imagem: image
      });
    }

    onClose();
  }

  return (
    <Modal className="max-w-xl" isOpen={isOpen} onClose={onClose} title={mode === 'choice' ? 'Criar' : 'Nova criacao'}>
      {mode === 'choice' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="group rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100"
            onClick={() => setMode('post')}
            type="button"
          >
            <Newspaper className="h-7 w-7 text-brand-blue" />
            <h3 className="mt-4 font-semibold text-brand-navy">Publicacao</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Texto, imagem ou os dois no feed da escola.</p>
          </button>
          <button
            className="group rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100"
            onClick={() => setMode('story')}
            type="button"
          >
            <Palette className="h-7 w-7 text-brand-blue" />
            <h3 className="mt-4 font-semibold text-brand-navy">Story</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Imagem ou texto colorido por 24 horas.</p>
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-4 ring-blue-50" name={user?.nomeCompleto} src={getAssetUrl(user?.fotoPerfil)} />
            <div>
              <p className="font-semibold text-brand-navy">{user?.nomeCompleto}</p>
              <p className="text-sm text-slate-500">{mode === 'post' ? 'Publicacao no feed' : 'Story por 24 horas'}</p>
            </div>
          </div>
          <textarea
            className="min-h-28 w-full resize-none rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100"
            maxLength={mode === 'post' ? 1000 : 280}
            onChange={(event) => setText(event.target.value)}
            placeholder={mode === 'post' ? 'No que voce esta pensando hoje?' : 'Escreva seu story'}
            value={text}
          />
          {mode === 'story' ? (
            <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              Fundo do texto
              <input
                aria-label="Cor de fundo do story"
                className="h-9 w-14 rounded-xl border border-slate-200 bg-white"
                onChange={(event) => setStoryBackground(event.target.value)}
                type="color"
                value={storyBackground}
              />
            </label>
          ) : null}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/40">
            <span className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <ImagePlus className="h-5 w-5 text-brand-blue" />
              {image ? image.name : 'Adicionar imagem'}
            </span>
            <input accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={handleImageChange} type="file" />
          </label>
          {localError || error ? <p className="text-sm font-medium text-red-600">{localError ?? error}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button disabled={isSubmitting} onClick={() => setMode('choice')} type="button" variant="secondary">
              Voltar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              Publicar
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function CreateContentButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-blue px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
      onClick={onClick}
      type="button"
    >
      <Plus className="h-4 w-4" />
      Criar
    </button>
  );
}
