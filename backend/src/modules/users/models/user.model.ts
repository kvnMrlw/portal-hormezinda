import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { Cargo, Sexo, Turma, Turno, type User } from '../types/user.types';

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
      trim: true,
      lowercase: true
    },
    senha: {
      type: String,
      required: true,
      select: false
    },
    dataNascimento: {
      type: Date
    },
    turno: {
      type: String,
      enum: Object.values(Turno)
    },
    turma: {
      type: String,
      enum: Object.values(Turma)
    },
    cargo: {
      type: String,
      enum: Object.values(Cargo),
      default: Cargo.ALUNO,
      required: true
    },
    pertenceGremio: {
      type: Boolean,
      default: false,
      index: true
    },
    sexo: {
      type: String,
      enum: Object.values(Sexo)
    },
    materia: {
      type: String,
      trim: true,
      default: ''
    },
    fotoPerfil: {
      type: String,
      default: ''
    },
    bannerPerfil: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    telefone: {
      type: String,
      default: '',
      trim: true,
      maxlength: 24
    },
    redeSocial: {
      type: String,
      default: ''
    },
    privacidade: {
      mostrarAniversario: { type: Boolean, default: true },
      mostrarBanner: { type: Boolean, default: true },
      mostrarBio: { type: Boolean, default: true },
      mostrarTelefone: { type: Boolean, default: false }
    },
    notificacoes: {
      aniversarios: { type: Boolean, default: true },
      avisos: { type: Boolean, default: true },
      cursos: { type: Boolean, default: true },
      ideias: { type: Boolean, default: true },
      publicacoes: { type: Boolean, default: true },
      stories: { type: Boolean, default: true }
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

userSchema.index({ cargo: 1, ativo: 1, nomeCompleto: 1 });
userSchema.index({ dataNascimento: 1, ativo: 1 });

export const UserModel: Model<User> = model<User>('User', userSchema);
