import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface AccountEmail {
  usuarioId: Types.ObjectId;
  usuario: string;
  email: string;
  verificado: boolean;
  verificadoEm?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AccountEmailDocument = HydratedDocument<AccountEmail>;

const accountEmailSchema = new Schema<AccountEmail>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    usuario: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    verificado: {
      type: Boolean,
      default: false,
      index: true
    },
    verificadoEm: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const AccountEmailModel = model<AccountEmail>(
  'AccountEmail',
  accountEmailSchema
);
