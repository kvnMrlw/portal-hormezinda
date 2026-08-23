import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type AuthCodePurpose = 'verify_email' | 'reset_password';

export interface AuthCode {
  usuarioId: Types.ObjectId;
  purpose: AuthCodePurpose;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  usedAt?: Date | null;
  verifiedAt?: Date | null;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AuthCodeDocument = HydratedDocument<AuthCode>;

const authCodeSchema = new Schema<AuthCode>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    purpose: {
      type: String,
      enum: ['verify_email', 'reset_password'],
      required: true,
      index: true
    },
    codeHash: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    resetTokenHash: {
      type: String,
      default: null
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

authCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authCodeSchema.index({ usuarioId: 1, purpose: 1, createdAt: -1 });

export const AuthCodeModel = model<AuthCode>('AuthCode', authCodeSchema);
