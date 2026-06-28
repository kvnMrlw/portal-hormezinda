import { ClassGroupModel, type ClassGroupDocument } from '../models/class-group.model';
import { RoomModel, type RoomDocument } from '../models/room.model';
import { SubjectModel, type SubjectDocument } from '../models/subject.model';
import type { ClassGroupPayload, RoomPayload, SubjectPayload } from '../types/catalog.types';

function subjectPayload(data: SubjectPayload) {
  return {
    cor: data.cor,
    icone: data.icone,
    nome: data.nome,
    professorPadrao: data.professorPadraoId || undefined
  };
}

export class CatalogRepository {
  async listClasses(): Promise<ClassGroupDocument[]> {
    return ClassGroupModel.find().sort({ turno: 1, nome: 1 });
  }

  async findClassById(id: string): Promise<ClassGroupDocument | null> {
    return ClassGroupModel.findById(id);
  }

  async findClassByName(nome: string): Promise<ClassGroupDocument | null> {
    return ClassGroupModel.findOne({ nome });
  }

  async createClass(data: ClassGroupPayload): Promise<ClassGroupDocument> {
    return ClassGroupModel.create(data);
  }

  async updateClass(id: string, data: ClassGroupPayload): Promise<ClassGroupDocument | null> {
    return ClassGroupModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteClass(id: string): Promise<void> {
    await ClassGroupModel.findByIdAndDelete(id);
  }

  async listSubjects(): Promise<SubjectDocument[]> {
    return SubjectModel.find().populate('professorPadrao').sort({ nome: 1 });
  }

  async findSubjectById(id: string): Promise<SubjectDocument | null> {
    return SubjectModel.findById(id).populate('professorPadrao');
  }

  async createSubject(data: SubjectPayload): Promise<SubjectDocument> {
    const subject = await SubjectModel.create(subjectPayload(data));

    return subject.populate('professorPadrao');
  }

  async updateSubject(id: string, data: SubjectPayload): Promise<SubjectDocument | null> {
    return SubjectModel.findByIdAndUpdate(id, subjectPayload(data), { new: true }).populate('professorPadrao');
  }

  async deleteSubject(id: string): Promise<void> {
    await SubjectModel.findByIdAndDelete(id);
  }

  async listRooms(): Promise<RoomDocument[]> {
    return RoomModel.find().sort({ bloco: 1, nome: 1 });
  }

  async findRoomById(id: string): Promise<RoomDocument | null> {
    return RoomModel.findById(id);
  }

  async createRoom(data: RoomPayload): Promise<RoomDocument> {
    return RoomModel.create(data);
  }

  async updateRoom(id: string, data: RoomPayload): Promise<RoomDocument | null> {
    return RoomModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRoom(id: string): Promise<void> {
    await RoomModel.findByIdAndDelete(id);
  }
}
