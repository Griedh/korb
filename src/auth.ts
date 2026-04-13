import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { AuthError, TokenReadError } from './errors.js';
import type { HttpClient } from './http-client.js';
import { expPayloadSchema, tokenResponseSchema } from './types/auth.js';

const tokenEndpoint = 'https://account.rewe.de/realms/sso/protocol/openid-connect/token';
const tokenDir = () => join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), 'korb', 'tokens');

export interface TokenStore {
  readAccess(): string;
  readRefresh(): string;
  storeAccess(v: string): void;
  storeRefresh(v: string): void;
}

export const mkTokenFileStore = (): TokenStore => ({
  readAccess: () => readToken('access_token'),
  readRefresh: () => readToken('refresh_token'),
  storeAccess: (v) => storeToken('access_token', v),
  storeRefresh: (v) => storeToken('refresh_token', v)
});

const readToken = (name: string): string => {
  try { return readFileSync(join(tokenDir(), name), 'utf8'); } catch (e) { throw new TokenReadError(String(e)); }
};
const storeToken = (name: string, value: string) => {
  mkdirSync(tokenDir(), { recursive: true });
  writeFileSync(join(tokenDir(), name), value);
};

const b64url = (buf: Buffer) => buf.toString('base64url');
const generatePKCE = () => {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
};

const generateAuthUrl = (challenge: string) =>
  'https://account.rewe.de/realms/sso/protocol/openid-connect/auth'
  + '?client_id=reweios&response_type=code&scope=openid%20email%20customer%20offline_access%20profile'
  + '&redirect_uri=de.rewe.app%3A%2F%2Fredirect'
  + `&code_challenge=${challenge}&code_challenge_method=S256`;

const extractCodeFromRedirect = (redirect: string): string => {
  const match = redirect.match(/code=([^&]+)/);
  if (!match) throw new AuthError("No auth code in redirect found - retry flow - make sure 'de.rewe.app..' is correct");
  return match[1];
};

const decodeJWTExp = (jwt: string): number => {
  const parts = jwt.split('.');
  if (parts.length < 2) throw new AuthError("Access token in wrong format - try 'korb login' again");
  const payload = expPayloadSchema.parse(JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')));
  return payload.exp;
};

export const mkAuth = (store: TokenStore, http: HttpClient) => ({
  getValidToken: (): string => {
    const access = store.readAccess();
    const exp = decodeJWTExp(access);
    const now = Math.floor(Date.now() / 1000);
    if (now < exp - 30) return access;
    const refreshed = tokenResponseSchema.parse(http.urlFromEncodedPost({ grant_type: 'refresh_token', client_id: 'reweios', refresh_token: store.readRefresh() }, tokenEndpoint));
    store.storeAccess(refreshed.access_token);
    store.storeRefresh(refreshed.refresh_token);
    return refreshed.access_token;
  },
  login: (): string => {
    const { verifier, challenge } = generatePKCE();
    console.log('1. Open this URL in Chrome (Firefox won\'t work):\n');
    console.log(generateAuthUrl(challenge));
    console.log('\n2. Log in and paste de.rewe.app://redirect?... URL:');
    const redirect = readFileSync(0, 'utf8').trim();
    const code = extractCodeFromRedirect(redirect);
    const tkn = tokenResponseSchema.parse(http.urlFromEncodedPost({
      grant_type: 'authorization_code', client_id: 'reweios', code, redirect_uri: 'de.rewe.app://redirect', code_verifier: verifier
    }, tokenEndpoint));
    store.storeAccess(tkn.access_token);
    store.storeRefresh(tkn.refresh_token);
    return 'Login succeeded, tokens stored';
  }
});
