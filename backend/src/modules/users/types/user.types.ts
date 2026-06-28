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

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO'
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
  dataNascimento?: Date;
  turno?: Turno;
  turma?: Turma;
  cargo: Cargo;
  sexo?: Sexo;
  materia?: string;
  fotoPerfil: string;
  bannerPerfil: string;
  bio: string;
  redeSocial: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicUser = Omit<User, 'senha'> & {
  id: string;
};

export type CreateUserData = Omit<User, 'criadoEm' | 'atualizadoEm'>;

export type AdminCreateUserData = Omit<User, 'criadoEm' | 'atualizadoEm'>;

export type AdminUpdateUserData = Partial<
  Pick<
    User,
    | 'ativo'
    | 'bannerPerfil'
    | 'cargo'
    | 'dataNascimento'
    | 'fotoPerfil'
    | 'materia'
    | 'senha'
    | 'sexo'
    | 'turma'
    | 'turno'
    | 'usuario'
  >
>;

export type UpdateProfileData = Partial<Pick<User, 'fotoPerfil' | 'bannerPerfil' | 'bio' | 'redeSocial' | 'senha'>>;
