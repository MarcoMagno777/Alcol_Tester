import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  AccountCreateRequest,
  LoginRequest,
  LoginResponse,
} from '../models/account.model';
import { ApiService } from './api.service';

const STORAGE_KEY = 'alcol_tester_user_id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly userId = signal<number | null>(this.readStoredUserId());

  register(body: AccountCreateRequest): Observable<{ message: string }> {
    return this.api.createAccount(body);
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.login(body).pipe(tap((res) => this.setUserId(res.user_id)));
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.userId.set(null);
    this.router.navigate(['/auth']);
  }

  setUserId(id: number): void {
    sessionStorage.setItem(STORAGE_KEY, String(id));
    this.userId.set(id);
  }

  isLoggedIn(): boolean {
    return this.userId() !== null;
  }

  private readStoredUserId(): number | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }
}
