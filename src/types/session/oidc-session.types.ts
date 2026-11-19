import type { AuthTokenPayload } from '@/types/contracts/auth/auth.types';

export interface OidcSessionData {
  claims: AuthTokenPayload;
  accessToken: string;
  refreshToken: string;
}

export interface MockSessionData extends OidcSessionData {
  username: string;
}
