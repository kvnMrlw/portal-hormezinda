import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { StoryKind, type Story } from '../types/feed.types';

export type StoryDocument = HydratedDocument<Story>;

const storyImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      default: '',
      trim: true
    },
    tipo: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: false }
);

const storySchema = new Schema<Story>(
  {
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tipo: {
      type: String,
      enum: Object.values(StoryKind),
      required: true
    },
    texto: {
      type: String,
      default: '',
      trim: true,
      maxlength: 280
    },
    imagem: {
      type: storyImageSchema
    },
    fundo: {
      type: String,
      default: '#2563eb',
      trim: true
    },
    visualizacoes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    expiraEm: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: {
      createdAt: 'data',
      updatedAt: 'atualizadoEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedStory) => {
        const storyObject = returnedStory as Partial<Story> & { _id?: unknown; visualizacoes?: unknown };

        delete storyObject._id;
        delete storyObject.visualizacoes;
      }
    }
  }
);

storySchema.index({ expiraEm: 1, data: -1 });

export const StoryModel: Model<Story> = model<Story>('Story', storySchema);
