import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { CourseContentType, CourseStatus, type Course } from '../types/course.types';

export type CourseDocument = HydratedDocument<Course>;

const courseAssetSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, trim: true },
    tamanho: { type: Number, required: true, min: 0 },
    url: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const courseCoverSchema = new Schema(
  {
    alt: { type: String, required: true, trim: true },
    nome: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, trim: true },
    tamanho: { type: Number, required: true, min: 0 },
    url: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const courseContentSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 120 },
    tipo: { type: String, enum: Object.values(CourseContentType), required: true, index: true },
    texto: { type: String, trim: true, maxlength: 5000, default: '' },
    arquivo: courseAssetSchema,
    link: { type: String, trim: true, maxlength: 500, default: '' },
    ordem: { type: Number, required: true, min: 0, default: 0 }
  },
  { timestamps: false }
);

const courseSchema = new Schema<Course>(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 140, index: true },
    descricao: { type: String, required: true, trim: true, maxlength: 1400 },
    capa: courseCoverSchema,
    categoria: { type: String, required: true, trim: true, maxlength: 80, index: true },
    professor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    arquivos: { type: [courseAssetSchema], default: [] },
    link: { type: String, trim: true, maxlength: 500, default: '' },
    conteudos: { type: [courseContentSchema], default: [] },
    status: { type: String, enum: Object.values(CourseStatus), default: CourseStatus.DRAFT, index: true }
  },
  {
    timestamps: {
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedCourse) => {
        const courseObject = returnedCourse as Partial<Course> & { _id?: unknown };

        delete courseObject._id;
      }
    }
  }
);

courseSchema.index({ titulo: 'text', descricao: 'text', categoria: 'text' });
courseSchema.index({ status: 1, categoria: 1, criadoEm: -1 });

export const CourseModel: Model<Course> = model<Course>('Course', courseSchema);
