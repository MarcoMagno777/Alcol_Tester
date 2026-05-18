import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
import {
  normalizeAccount,
  normalizeAlcolCatalog,
  normalizeDrinkEntry,
  normalizeFoodEntry,
  normalizeSazietaCatalog,
  toNumber,
} from '../utils/api-mapper';

const NO_CACHE = new HttpHeaders({
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
});

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  createAccount(body: AccountCreateRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/accounts/create', body);
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/accounts/login', body)
      .pipe(
        map((res) => ({
          ...res,
          user_id: toNumber(res.user_id),
        })),
      );
  }

  getAccount(id: number): Observable<Account> {
    return this.http
      .get<Account>(`/accounts/${id}`, { headers: NO_CACHE })
      .pipe(map((account) => normalizeAccount(account)));
  }

  updateAccount(id: number, body: AccountUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`/accounts/${id}`, body);
  }

  resetSession(accountId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/accounts/${accountId}/session`);
  }

  getAlcolCatalog(): Observable<AlcolCatalogItem[]> {
    return this.http
      .get<AlcolCatalogItem[]>('/alcol/catalog', { headers: NO_CACHE })
      .pipe(map((items) => normalizeAlcolCatalog(items)));
  }

  getAccountAlcol(accountId: number): Observable<AccountAlcolEntry[]> {
    return this.http
      .get<AccountAlcolEntry[]>(`/alcol/${accountId}`, { headers: NO_CACHE })
      .pipe(map((items) => items.map(normalizeDrinkEntry)));
  }

  addAlcol(body: AlcolAddRequest): Observable<{ message: string; id: number }> {
    return this.http
      .post<{ message: string; id: number }>('/alcol', {
        ...body,
        account_id: toNumber(body.account_id),
        alcol_id: toNumber(body.alcol_id),
      })
      .pipe(map((res) => ({ ...res, id: toNumber(res.id) })));
  }

  getSazietaCatalog(): Observable<SazietaCatalogItem[]> {
    return this.http
      .get<SazietaCatalogItem[]>('/sazieta/catalog', { headers: NO_CACHE })
      .pipe(map((items) => normalizeSazietaCatalog(items)));
  }

  getAccountSazieta(accountId: number): Observable<AccountSazietaEntry[]> {
    return this.http
      .get<AccountSazietaEntry[]>(`/sazieta/${accountId}`, { headers: NO_CACHE })
      .pipe(map((items) => items.map(normalizeFoodEntry)));
  }

  addSazieta(body: SazietaAddRequest): Observable<{ message: string; id: number }> {
    return this.http
      .post<{ message: string; id: number }>('/sazieta', {
        ...body,
        account_id: toNumber(body.account_id),
        stato_sazieta_id: toNumber(body.stato_sazieta_id),
      })
      .pipe(map((res) => ({ ...res, id: toNumber(res.id) })));
  }
}
