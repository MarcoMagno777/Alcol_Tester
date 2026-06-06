export type Genere = 'M' | 'F';

export interface Account {
  id: number;
  username: string;
  email: string;
  altezza: number;
  peso: number;
  genere: Genere;
}

export interface AccountCreateRequest {
  username: string;
  email: string;
  password: string;
  altezza: number;
  peso: number;
  genere: Genere;
}

export interface AccountUpdateRequest {
  altezza: number;
  peso: number;
  genere: Genere;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
}
