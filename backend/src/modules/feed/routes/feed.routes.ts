import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import { createPost, likePost, listPosts } from '../controller/feed.controller';

const router = Router();

const postAuthorRoles = [Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR, Cargo.GREMIO];

router.get('/', authenticate, listPosts);
router.post('/', authenticate, authorizeRoles(...postAuthorRoles), createPost);
router.post('/:id/like', authenticate, likePost);

export default router;
