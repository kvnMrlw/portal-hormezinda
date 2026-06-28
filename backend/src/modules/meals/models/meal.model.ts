import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

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
    data: { type: Date, required: true, index: true },
    categoria: { type: String, enum: Object.values(MealCategory), required: true, index: true },
    observacoes: { type: String, trim: true, maxlength: 500, default: '' },
    ingredientes: { type: [String], default: [], index: true },
    alergenos: { type: [String], default: [] },
    vegetariano: { type: Boolean, default: false, index: true },
    vegano: { type: Boolean, default: false, index: true },
    semLactose: { type: Boolean, default: false, index: true },
    semGluten: { type: Boolean, default: false, index: true },
    calorias: { type: Number, min: 0 },
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

mealSchema.index({ data: 1, categoria: 1, status: 1 });
mealSchema.index({ nome: 'text', descricao: 'text', ingredientes: 'text', categoria: 'text' });

export const MealModel: Model<Meal> = model<Meal>('Meal', mealSchema);
