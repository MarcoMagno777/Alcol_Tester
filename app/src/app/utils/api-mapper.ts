import { Account } from '../models/account.model';
import { AccountAlcolEntry, AlcolCatalogItem } from '../models/alcol.model';
import { AccountSazietaEntry, SazietaCatalogItem } from '../models/sazieta.model';

export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Converte datetime MySQL (YYYY-MM-DD HH:mm:ss) in Date affidabile. */
export function parseDateTime(value: string): Date {
  if (!value) {
    return new Date(NaN);
  }
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
}

/** Data/ora locale per il DB (evita scostamenti UTC). */
export function formatLocalDateTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatLocalDate(date: Date = new Date()): string {
  return formatLocalDateTime(date).slice(0, 10);
}

export function normalizeAccount(raw: Account): Account {
  return {
    ...raw,
    id: toNumber(raw.id),
    altezza: toNumber(raw.altezza),
    peso: toNumber(raw.peso),
  };
}

export function normalizeAlcolCatalog(items: AlcolCatalogItem[]): AlcolCatalogItem[] {
  return items.map((item) => ({
    ...item,
    id: toNumber(item.id),
    quantita: toNumber(item.quantita),
    gradazione: toNumber(item.gradazione),
  }));
}

export function normalizeDrinkEntry(raw: AccountAlcolEntry): AccountAlcolEntry {
  return {
    ...raw,
    id: toNumber(raw.id),
    alcol_id: toNumber(raw.alcol_id),
    quantita: toNumber(raw.quantita),
    gradazione: toNumber(raw.gradazione),
  };
}

export function normalizeFoodEntry(raw: AccountSazietaEntry): AccountSazietaEntry {
  return {
    ...raw,
    id: toNumber(raw.id),
    stato_sazieta_id: toNumber(raw.stato_sazieta_id),
  };
}

export function normalizeSazietaCatalog(items: SazietaCatalogItem[]): SazietaCatalogItem[] {
  return items.map((item) => ({
    ...item,
    id: toNumber(item.id),
  }));
}
