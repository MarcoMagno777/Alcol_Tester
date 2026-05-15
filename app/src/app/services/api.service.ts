import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Account,
  AccountCreateRequest,
  AccountUpdateRequest,
  LoginRequest,
  LoginResponse,
} from '../models/account.model';
import { AccountAlcolEntry, AlcolAddRequest, AlcolCatalogItem } from '../models/alcol.model';
import {
  AccountSazietaEntry,
  SazietaAddRequest,
  SazietaCatalogItem,
} from '../models/sazieta.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  createAccount(body: AccountCreateRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/accounts/create', body);
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/accounts/login', body);
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`/accounts/${id}`);
  }

  updateAccount(id: number, body: AccountUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`/accounts/${id}`, body);
  }

  getAlcolCatalog(): Observable<AlcolCatalogItem[]> {
    return this.http.get<AlcolCatalogItem[]>('/alcol/catalog');
  }

  getAccountAlcol(accountId: number): Observable<AccountAlcolEntry[]> {
    return this.http.get<AccountAlcolEntry[]>(`/alcol/${accountId}`);
  }

  addAlcol(body: AlcolAddRequest): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>('/alcol', body);
  }

  getSazietaCatalog(): Observable<SazietaCatalogItem[]> {
    return this.http.get<SazietaCatalogItem[]>('/sazieta/catalog');
  }

  getAccountSazieta(accountId: number): Observable<AccountSazietaEntry[]> {
    return this.http.get<AccountSazietaEntry[]>(`/sazieta/${accountId}`);
  }

  addSazieta(body: SazietaAddRequest): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>('/sazieta', body);
  }
}
