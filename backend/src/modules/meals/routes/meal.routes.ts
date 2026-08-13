import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import { createMeal, deleteMeal, listMeals, updateMeal } from '../controller/meal.controller';
import { mealUpload } from '../middlewares/meal-upload.middleware';

const router = Router();

router.get('/', authenticate, listMeals);
router.post('/', authenticate, authorizeRoles(Cargo.ADMIN), mealUpload.single('imagem'), createMeal);
router.patch('/:id', authenticate, authorizeRoles(Cargo.ADMIN), mealUpload.single('imagem'), updateMeal);
router.delete('/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteMeal);

export default router;
