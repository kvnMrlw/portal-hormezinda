import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo } from '../../users/types/user.types';
import { CatalogRepository } from '../repository/catalog.repository';
import type {
  ClassGroupPayload,
  PublicClassGroup,
  PublicRoom,
  PublicSubject,
  RoomPayload,
  Subject,
  SubjectPayload
} from '../types/catalog.types';

function isUserDocument(user: Subject['professores'][number] | Subject['professorPadrao']): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function toPublicClassGroup(classGroup: Awaited<ReturnType<CatalogRepository['findClassById']>> extends infer T ? NonNullable<T> : never): PublicClassGroup {
  return {
    id: classGroup.id,
    ano: classGroup.ano,
    criadoEm: classGroup.criadoEm,
    nome: classGroup.nome,
    observacoes: classGroup.observacoes ?? '',
    turno: classGroup.turno,
    atualizadoEm: classGroup.atualizadoEm
  };
}

function toPublicSubject(subject: Awaited<ReturnType<CatalogRepository['findSubjectById']>> extends infer T ? NonNullable<T> : never): PublicSubject {
  const teachers = (subject.professores?.length ? subject.professores : subject.professorPadrao ? [subject.professorPadrao] : [])
    .filter(isUserDocument)
    .map(toPublicUser);

  return {
    id: subject.id,
    cor: subject.cor,
    criadoEm: subject.criadoEm,
    icone: subject.icone,
    nome: subject.nome,
    professores: teachers,
    professorPadrao: teachers[0],
    atualizadoEm: subject.atualizadoEm
  };
}

function toPublicRoom(room: Awaited<ReturnType<CatalogRepository['findRoomById']>> extends infer T ? NonNullable<T> : never): PublicRoom {
  return {
    id: room.id,
    bloco: room.bloco ?? '',
    capacidade: room.capacidade,
    criadoEm: room.criadoEm,
    nome: room.nome,
    observacoes: room.observacoes ?? '',
    atualizadoEm: room.atualizadoEm
  };
}

export class CatalogService {
  constructor(
    private readonly catalogRepository = new CatalogRepository(),
    private readonly userRepository = new UserRepository()
  ) {}

  async listAll() {
    const [turmas, disciplinas, salas] = await Promise.all([
      this.catalogRepository.listClasses(),
      this.catalogRepository.listSubjects(),
      this.catalogRepository.listRooms()
    ]);

    return {
      disciplinas: disciplinas.map(toPublicSubject),
      salas: salas.map(toPublicRoom),
      turmas: turmas.map(toPublicClassGroup)
    };
  }

  async createClass(data: ClassGroupPayload): Promise<PublicClassGroup> {
    const classGroup = await this.catalogRepository.createClass(data);

    return toPublicClassGroup(classGroup);
  }

  async updateClass(id: string, data: ClassGroupPayload): Promise<PublicClassGroup | null> {
    const classGroup = await this.catalogRepository.updateClass(id, data);

    return classGroup ? toPublicClassGroup(classGroup) : null;
  }

  async deleteClass(id: string): Promise<boolean> {
    const classGroup = await this.catalogRepository.findClassById(id);

    if (!classGroup) {
      return false;
    }

    await this.catalogRepository.deleteClass(id);

    return true;
  }

  async createSubject(data: SubjectPayload): Promise<PublicSubject> {
    await this.validateSubjectPayload(data);
    const subject = await this.catalogRepository.createSubject(data);

    return toPublicSubject(subject);
  }

  async updateSubject(id: string, data: SubjectPayload): Promise<PublicSubject | null> {
    const currentSubject = await this.catalogRepository.findSubjectById(id);

    if (!currentSubject) {
      return null;
    }

    await this.validateSubjectPayload(data);
    const subject = await this.catalogRepository.updateSubject(id, data);

    return subject ? toPublicSubject(subject) : null;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const subject = await this.catalogRepository.findSubjectById(id);

    if (!subject) {
      return false;
    }

    await this.catalogRepository.deleteSubject(id);

    return true;
  }

  async createRoom(data: RoomPayload): Promise<PublicRoom> {
    const room = await this.catalogRepository.createRoom(data);

    return toPublicRoom(room);
  }

  async updateRoom(id: string, data: RoomPayload): Promise<PublicRoom | null> {
    const room = await this.catalogRepository.updateRoom(id, data);

    return room ? toPublicRoom(room) : null;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const room = await this.catalogRepository.findRoomById(id);

    if (!room) {
      return false;
    }

    await this.catalogRepository.deleteRoom(id);

    return true;
  }

  private async validateSubjectPayload(data: SubjectPayload): Promise<void> {
    if (!data.professorIds?.length) {
      return;
    }

    const teachers = await Promise.all(data.professorIds.map((teacherId) => this.userRepository.findById(teacherId)));

    if (teachers.some((teacher) => !teacher || !teacher.ativo || teacher.cargo !== Cargo.PROFESSOR)) {
      throw new AppError('Professor invalido para esta disciplina', 400);
    }
  }
}
