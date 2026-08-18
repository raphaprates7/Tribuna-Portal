export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  accessToken: string;
  expiraEm: string;
  email: string;
  nomeCompleto: string;
  roles: string[];
}
