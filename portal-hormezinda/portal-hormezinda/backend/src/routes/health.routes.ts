import { Router } from 'express';

import { apiResponse } from '../utils/apiResponse';

const router = Router();

router.get('/', (_request, response) => {
  return response.status(200).json(
    apiResponse({
      status: 'ok',
      project: 'Portal Hormezinda',
      timestamp: new Date().toISOString()
    })
  );
});

export default router;
