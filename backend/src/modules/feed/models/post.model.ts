import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { reactionEmojis, type Post } from '../types/feed.types';

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
      default: '',
      trim: true,
      maxlength: 1000
    },
    imagens: {
      type: [postImageSchema],
      default: []
    },
    reacoes: {
      type: [
        {
          usuario: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
          },
          emoji: {
            type: String,
            enum: reactionEmojis,
            required: true
          }
        }
      ],
      default: []
    },
    fixado: {
      type: Boolean,
      default: false,
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
      transform: (_document, returnedPost) => {
        const postObject = returnedPost as Partial<Post> & { _id?: unknown; reacoes?: unknown };

        delete postObject._id;
        delete postObject.reacoes;
      }
    }
  }
);

postSchema.index({ fixado: -1, data: -1 });
postSchema.index({ data: -1 });

export const PostModel: Model<Post> = model<Post>('Post', postSchema);
