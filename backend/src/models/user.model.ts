import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

export enum Turno {
  MATUTINO = 'Matutino',
  VESPERTINO = 'Vespertino'
}

export enum Turma {
  PRIMEIRO_A = '1A',
  PRIMEIRO_B = '1B',
  PRIMEIRO_C = '1C',
  SEGUNDO_A = '2A',
  SEGUNDO_B = '2B',
  SEGUNDO_C = '2C',
  SEGUNDO_D = '2D',
  SEGUNDO_E = '2E',
  SEGUNDO_F = '2F',
  SEGUNDO_G = '2G',
  TERCEIRO_A = '3A',
  TERCEIRO_B = '3B',
  TERCEIRO_C = '3C',
  TERCEIRO_D = '3D',
  TERCEIRO_E = '3E',
  TERCEIRO_F = '3F'
}

export enum Cargo {
  ADMIN = 'ADMIN',
  DIRETOR = 'DIRETOR',
  COORDENADOR = 'COORDENADOR',
  PROFESSOR = 'PROFESSOR',
  GREMIO = 'GREMIO',
  ALUNO = 'ALUNO'
}

export const turmasPorTurno: Record<Turno, Turma[]> = {
  [Turno.MATUTINO]: [
    Turma.PRIMEIRO_A,
    Turma.SEGUNDO_A,
    Turma.SEGUNDO_B,
    Turma.SEGUNDO_C,
    Turma.SEGUNDO_D,
    Turma.TERCEIRO_A,
    Turma.TERCEIRO_B,
    Turma.TERCEIRO_C
  ],
  [Turno.VESPERTINO]: [
    Turma.PRIMEIRO_B,
    Turma.PRIMEIRO_C,
    Turma.SEGUNDO_E,
    Turma.SEGUNDO_F,
    Turma.SEGUNDO_G,
    Turma.TERCEIRO_D,
    Turma.TERCEIRO_E,
    Turma.TERCEIRO_F
  ]
};

export type User = {
  nomeCompleto: string;
  usuario: string;
  senha: string;
  dataNascimento: Date;
  turno: Turno;
  turma: Turma;
  cargo: Cargo;
  fotoPerfil: string;
  bio: string;
  redeSocial: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

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

// Modelo central dos usuarios autenticaveis do Portal Hormezinda.
export const UserModel: Model<User> = model<User>('User', userSchema);
