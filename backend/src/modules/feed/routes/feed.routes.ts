import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import {
  createPost,
  createStory,
  deletePost,
  deleteStory,
  listPosts,
  listStories,
  pinPost,
  reactToPost,
  viewStory
} from '../controller/feed.controller';
import { feedUpload } from '../middlewares/upload.middleware';

const router = Router();

const postAuthorRoles = [Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR, Cargo.GREMIO];
const pinPostRoles = [Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR];

router.get('/', authenticate, listPosts);
router.post('/', authenticate, authorizeRoles(...postAuthorRoles), feedUpload.single('imagem'), createPost);
router.get('/stories', authenticate, listStories);
router.post('/stories', authenticate, authorizeRoles(...postAuthorRoles), feedUpload.single('imagem'), createStory);
router.post('/stories/:id/view', authenticate, viewStory);
router.delete('/stories/:id', authenticate, deleteStory);
router.post('/:id/reactions', authenticate, reactToPost);
router.patch('/:id/pin', authenticate, authorizeRoles(...pinPostRoles), pinPost);
router.delete('/:id', authenticate, deletePost);

export default router;
