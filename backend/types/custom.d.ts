// backend/types/custom.d.ts
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      email?: string;
    };
    accessToken?: string;
    provider?: string;
  }
}
