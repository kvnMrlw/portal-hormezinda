import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { Weekday } from '../../schedules/types/schedule.types';
import { MealCategory, MealStatus, type Meal } from '../types/meal.types';

export type MealDocument = HydratedDocument<Meal>;

const mealImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const mealSchema = new Schema<Meal>(
  {
    nome: { type: String, required: true, trim: true, maxlength: 100, index: true },
    descricao: { type: String, required: true, trim: true, maxlength: 800 },
    imagem: mealImageSchema,
    data: { type: Date, index: true },
    diaSemana: { type: String, enum: Object.values(Weekday), index: true },
    categoria: { type: String, enum: Object.values(MealCategory), required: true, index: true },
    status: { type: String, enum: Object.values(MealStatus), default: MealStatus.DRAFT, index: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedMeal) => {
        const mealObject = returnedMeal as Partial<Meal> & { _id?: unknown };
        delete mealObject._id;
      }
    }
  }
);

mealSchema.index({ diaSemana: 1, categoria: 1, status: 1 });
mealSchema.index({ nome: 'text', descricao: 'text', categoria: 'text' });

export const MealModel: Model<Meal> = model<Meal>('Meal', mealSchema);
