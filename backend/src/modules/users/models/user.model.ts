import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { Cargo, Turma, Turno, type User } from '../types/user.types';

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    nomeCompleto: {
      type: String,
      required: true,
      trim: true
    },
    usuario: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    senha: {
      type: String,
      required: true,
      select: false
    },
    dataNascimento: {
      type: Date,
      required: true
    },
    turno: {
      type: String,
      enum: Object.values(Turno),
      required: true
    },
    turma: {
      type: String,
      enum: Object.values(Turma),
      required: true
    },
    cargo: {
      type: String,
      enum: Object.values(Cargo),
      default: Cargo.ALUNO,
      required: true
    },
    fotoPerfil: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    redeSocial: {
      type: String,
      default: ''
    },
    ativo: {
      type: Boolean,
      default: true,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedUser) => {
        const userObject = returnedUser as Partial<User> & { _id?: unknown };

        delete userObject._id;
        delete userObject.senha;
      }
    }
  }
);

export const UserModel: Model<User> = model<User>('User', userSchema);
