import type { Response } from 'express';

import { apiResponse } from '../../../utils/apiResponse';

export function usersHealth(_request: unknown, response: Response): Response {
  return response.status(200).json(apiResponse({ module: 'users' }));
}
