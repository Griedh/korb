import { z } from 'zod';

export const accessTokenSchema = z.object({ value: z.string() }).passthrough();
export type AccessToken = z.infer<typeof accessTokenSchema>;

export const refreshTokenSchema = z.object({ value: z.string() }).passthrough();
export type RefreshToken = z.infer<typeof refreshTokenSchema>;

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_expires_in: z.number(),
  refresh_token: z.string(),
  token_type: z.string(),
  id_token: z.string(),
  scope: z.string()
}).passthrough();
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

export const expPayloadSchema = z.object({ exp: z.number() }).passthrough();
export type ExpPayload = z.infer<typeof expPayloadSchema>;
