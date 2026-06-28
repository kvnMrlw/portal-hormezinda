import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import {
  createIdea,
  deleteIdea,
  listIdeas,
  listUserIdeas,
  reactToIdea,
  toggleIdeaSupport,
  updateIdea,
  updateIdeaAdmin
} from '../controller/idea.controller';
import { ideaUpload } from '../middlewares/idea-upload.middleware';

const router = Router();
const ideaAuthorRoles = [Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR, Cargo.GREMIO, Cargo.ALUNO];

router.get('/', authenticate, listIdeas);
router.get('/users/:id', authenticate, listUserIdeas);
router.post('/', authenticate, authorizeRoles(...ideaAuthorRoles), ideaUpload.single('imagem'), createIdea);
router.patch('/:id', authenticate, authorizeRoles(...ideaAuthorRoles), ideaUpload.single('imagem'), updateIdea);
router.patch('/:id/admin', authenticate, authorizeRoles(Cargo.ADMIN), updateIdeaAdmin);
router.post('/:id/support', authenticate, toggleIdeaSupport);
router.post('/:id/reactions', authenticate, reactToIdea);
router.delete('/:id', authenticate, deleteIdea);

export default router;
