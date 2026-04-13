export interface AccessToken {
  value: string;
}

export interface RefreshToken {
  value: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  scope: string;
}

export interface ExpPayload {
  exp: number;
}
