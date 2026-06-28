import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { reactionEmojis } from '../../feed/types/feed.types';
import { IdeaCategory, IdeaStatus, type Idea } from '../types/idea.types';

export type IdeaDocument = HydratedDocument<Idea>;

const ideaImageSchema = new Schema(
  {
    alt: { type: String, required: true, trim: true },
    nome: { type: String, required: true, trim: true },
    tamanho: { type: Number, required: true, min: 0 },
    thumbnailUrl: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const officialResponseSchema = new Schema(
  {
    autor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    texto: { type: String, required: true, trim: true, maxlength: 1200 },
    respondidaEm: { type: Date, default: Date.now, required: true }
  },
  { _id: false }
);

const ideaSchema = new Schema<Idea>(
  {
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    categoria: {
      type: String,
      enum: Object.values(IdeaCategory),
      required: true,
      index: true
    },
    imagem: ideaImageSchema,
    apoios: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    reacoes: {
      type: [
        {
          usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          emoji: { type: String, enum: reactionEmojis, required: true }
        }
      ],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(IdeaStatus),
      default: IdeaStatus.REVIEW,
      required: true,
      index: true
    },
    destaque: {
      type: Boolean,
      default: false,
      index: true
    },
    respostaOficial: officialResponseSchema
  },
  {
    timestamps: {
      createdAt: 'criadaEm',
      updatedAt: 'atualizadaEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedIdea) => {
        const ideaObject = returnedIdea as Partial<Idea> & { _id?: unknown; apoios?: unknown; reacoes?: unknown };

        delete ideaObject._id;
        delete ideaObject.apoios;
        delete ideaObject.reacoes;
      }
    }
  }
);

ideaSchema.index({ destaque: -1, criadaEm: -1 });
ideaSchema.index({ status: 1, categoria: 1, criadaEm: -1 });
ideaSchema.index({ titulo: 'text', descricao: 'text', categoria: 'text' });

export const IdeaModel: Model<Idea> = model<Idea>('Idea', ideaSchema);
