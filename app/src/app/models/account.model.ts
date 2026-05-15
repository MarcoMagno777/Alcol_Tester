export type Genere = 'M' | 'F';

export interface Account {
  id: number;
  username: string;
  altezza: number;
  peso: number;
  genere: Genere;
}

export interface AccountCreateRequest {
  username: string;
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
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
}
