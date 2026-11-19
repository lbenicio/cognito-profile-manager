import { z } from 'zod';

export const oauthTokenSuccessSchema = z.object({
  id_token: z.string().min(1),
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

export type OAuthTokenSuccessResponse = z.infer<typeof oauthTokenSuccessSchema>;

export const oauthTokenErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export type OAuthTokenErrorResponse = z.infer<typeof oauthTokenErrorSchema>;
