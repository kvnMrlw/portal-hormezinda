import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_request, response) => {
  const ready = mongoose.connection.readyState === 1;

  return response.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? 'API pronta' : 'API aguardando banco de dados',
    data: {
      database: ready ? 'connected' : 'unavailable'
    }
  });
});

export default router;
