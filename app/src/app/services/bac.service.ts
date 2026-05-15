import { Injectable } from '@angular/core';
import { Account, Genere } from '../models/account.model';
import { AccountAlcolEntry, AlcolCatalogItem } from '../models/alcol.model';
import { AccountSazietaEntry } from '../models/sazieta.model';
import {
  BAC_BAR_MAX,
  BAC_ZONES,
  BacState,
  BacZone,
} from '../models/bac.model';

const ETHANOL_DENSITY = 0.789;
const ELIMINATION_RATE = 0.15;

const SATIETY_MULTIPLIER: Record<number, number> = {
  1: 1,
  2: 0.88,
  3: 0.72,
  4: 0.55,
};

@Injectable({ providedIn: 'root' })
export class BacService {
  calculateState(
    account: Account,
    drinks: AccountAlcolEntry[],
    foodLog: AccountSazietaEntry[],
    now: Date = new Date(),
    previewDrink?: AlcolCatalogItem | null,
  ): BacState {
    const current = this.calculateBac(account, drinks, foodLog, now);
    const preview =
      previewDrink !== undefined && previewDrink !== null
        ? this.calculateBac(
            account,
            [
              ...drinks,
              this.toPreviewEntry(previewDrink, now),
            ],
            foodLog,
            now,
          )
        : null;

    const value = preview ?? current;
    const zone = this.getZone(value);

    return {
      value,
      zone: zone.id,
      zoneLabel: zone.label,
      timeToZero: this.getTimeToZero(value, now),
      formattedCountdown: this.formatCountdown(value, now),
    };
  }

  getPreviewValue(
    account: Account,
    drinks: AccountAlcolEntry[],
    foodLog: AccountSazietaEntry[],
    previewDrink: AlcolCatalogItem | null,
    now: Date = new Date(),
  ): number | null {
    if (!previewDrink) {
      return null;
    }

    return this.calculateBac(
      account,
      [...drinks, this.toPreviewEntry(previewDrink, now)],
      foodLog,
      now,
    );
  }

  getZone(bac: number): (typeof BAC_ZONES)[number] {
    const clamped = Math.max(0, bac);
    return (
      BAC_ZONES.find((z) => clamped >= z.min && clamped < z.max) ??
      BAC_ZONES[BAC_ZONES.length - 1]
    );
  }

  getBarPercent(bac: number): number {
    return Math.min(100, Math.max(0, (bac / BAC_BAR_MAX) * 100));
  }

  getSatietyMultiplierAt(
    foodLog: AccountSazietaEntry[],
    at: Date,
  ): number {
    const latest = [...foodLog]
      .filter((f) => new Date(f.consumato_il) <= at)
      .sort(
        (a, b) =>
          new Date(b.consumato_il).getTime() - new Date(a.consumato_il).getTime(),
      )[0];

    if (!latest) {
      return SATIETY_MULTIPLIER[1];
    }

    return SATIETY_MULTIPLIER[latest.stato_sazieta_id] ?? SATIETY_MULTIPLIER[1];
  }

  private calculateBac(
    account: Account,
    drinks: AccountAlcolEntry[],
    foodLog: AccountSazietaEntry[],
    now: Date,
  ): number {
    const r = account.genere === 'M' ? 0.68 : 0.55;

    return drinks.reduce((total, drink) => {
      const consumedAt = new Date(drink.consumato_il);
      const hoursElapsed = Math.max(0, (now.getTime() - consumedAt.getTime()) / 3_600_000);
      const grams = this.gramsOfAlcohol(drink.quantita, drink.gradazione);
      const multiplier = this.getSatietyMultiplierAt(foodLog, consumedAt);
      const peak = (grams / (r * account.peso)) * multiplier;
      const remaining = Math.max(0, peak - ELIMINATION_RATE * hoursElapsed);
      return total + remaining;
    }, 0);
  }

  private gramsOfAlcohol(volumeMl: number, gradazione: number): number {
    return volumeMl * (gradazione / 100) * ETHANOL_DENSITY;
  }

  private toPreviewEntry(drink: AlcolCatalogItem, now: Date): AccountAlcolEntry {
    return {
      id: -1,
      alcol_id: drink.id,
      data_consumo: now.toISOString().slice(0, 10),
      consumato_il: now.toISOString(),
      nome: drink.nome,
      quantita: drink.quantita,
      gradazione: drink.gradazione,
    };
  }

  private getTimeToZero(bac: number, now: Date): Date | null {
    if (bac <= 0) {
      return null;
    }

    const hours = bac / ELIMINATION_RATE;
    return new Date(now.getTime() + hours * 3_600_000);
  }

  private formatCountdown(bac: number, now: Date): string {
    if (bac <= 0) {
      return 'Sei sobrio';
    }

    const target = this.getTimeToZero(bac, now);
    if (!target) {
      return '—';
    }

    const diffMs = target.getTime() - now.getTime();
    const totalMinutes = Math.max(0, Math.ceil(diffMs / 60_000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }
}
