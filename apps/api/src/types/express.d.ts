import type { TokenPayload } from '../utils/jwt.js';
import type { Role } from '@campus-peer-support/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { role: Role };
    }
  }
}

export {};
