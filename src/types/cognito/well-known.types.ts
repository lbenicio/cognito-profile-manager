export interface WellKnownConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
  logout_endpoint?: string;
  [key: string]: unknown;
}
