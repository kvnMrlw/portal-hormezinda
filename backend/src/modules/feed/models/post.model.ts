import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Post } from '../types/feed.types';

export type PostDocument = HydratedDocument<Post>;

const postImageSchema = new Schema(
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

const postSchema = new Schema<Post>(
  {
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    texto: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    imagens: {
      type: [postImageSchema],
      default: []
    },
    curtidas: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    quantidadeCurtidas: {
      type: Number,
      default: 0,
      min: 0
    },
    quantidadeComentarios: {
      type: Number,
      default: 0,
      min: 0
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
      transform: (_document, returnedPost) => {
        const postObject = returnedPost as Partial<Post> & { _id?: unknown; curtidas?: unknown };

        delete postObject._id;
        delete postObject.curtidas;
      }
    }
  }
);

postSchema.index({ data: -1 });

export const PostModel: Model<Post> = model<Post>('Post', postSchema);
