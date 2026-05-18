import { Injectable } from '@angular/core';
import { Account } from '../models/account.model';
import { AccountAlcolEntry, AlcolCatalogItem } from '../models/alcol.model';
import { AccountSazietaEntry } from '../models/sazieta.model';
import {
  BAC_BAR_MAX,
  BAC_ZONES,
  BacState,
} from '../models/bac.model';
import { formatLocalDate, formatLocalDateTime, parseDateTime, toNumber } from '../utils/api-mapper';

const ETHANOL_DENSITY = 0.789;
const ELIMINATION_RATE = 0.15;

const SATIETY_MULTIPLIER: Record<number, number> = {
  1: 1,
  2: 0.88,
  3: 0.72,
  4: 0.55,
};

const SATIETY_LABELS: Record<number, string> = {
  1: 'Stomaco vuoto',
  2: 'Mangiato un pochino',
  3: 'Meta sazietà',
  4: 'Pieno',
};

export interface BacTimelinePoint {
  at: Date;
  bac: number;
}

export interface SatietyInfo {
  statoId: number;
  label: string;
  multiplier: number;
  recordedAt: Date | null;
}

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
            [...drinks, this.toPreviewEntry(previewDrink, now)],
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

  getCurrentSatiety(foodLog: AccountSazietaEntry[], now: Date = new Date()): SatietyInfo {
    const multiplier = this.getSatietyMultiplierAt(foodLog, now);
    const latest = this.getLatestFoodBefore(foodLog, now);
    const statoId = latest ? toNumber(latest.stato_sazieta_id) : 1;

    return {
      statoId,
      label: SATIETY_LABELS[statoId] ?? SATIETY_LABELS[1],
      multiplier,
      recordedAt: latest ? parseDateTime(latest.consumato_il) : null,
    };
  }

  getTimeline(
    account: Account,
    drinks: AccountAlcolEntry[],
    foodLog: AccountSazietaEntry[],
    now: Date = new Date(),
    pastHours = 2,
    futureHours = 8,
    stepMinutes = 15,
  ): BacTimelinePoint[] {
    const points: BacTimelinePoint[] = [];
    const start = new Date(now.getTime() - pastHours * 3_600_000);
    const end = new Date(now.getTime() + futureHours * 3_600_000);
    const stepMs = stepMinutes * 60_000;

    for (let t = start.getTime(); t <= end.getTime(); t += stepMs) {
      const at = new Date(t);
      points.push({
        at,
        bac: this.calculateBac(account, drinks, foodLog, at),
      });
    }

    return points;
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
    const latest = this.getLatestFoodBefore(foodLog, at);

    if (!latest) {
      return SATIETY_MULTIPLIER[1];
    }

    const statoId = toNumber(latest.stato_sazieta_id);
    return SATIETY_MULTIPLIER[statoId] ?? SATIETY_MULTIPLIER[1];
  }

  private getLatestFoodBefore(
    foodLog: AccountSazietaEntry[],
    at: Date,
  ): AccountSazietaEntry | undefined {
    return [...foodLog]
      .filter((f) => parseDateTime(f.consumato_il).getTime() <= at.getTime())
      .sort(
        (a, b) =>
          parseDateTime(b.consumato_il).getTime() -
          parseDateTime(a.consumato_il).getTime(),
      )[0];
  }

  calculateBac(
    account: Account,
    drinks: AccountAlcolEntry[],
    foodLog: AccountSazietaEntry[],
    now: Date,
  ): number {
    const r = account.genere === 'M' ? 0.68 : 0.55;

    return drinks.reduce((total, drink) => {
      const consumedAt = parseDateTime(drink.consumato_il);
      if (Number.isNaN(consumedAt.getTime())) {
        return total;
      }

      const hoursElapsed = Math.max(
        0,
        (now.getTime() - consumedAt.getTime()) / 3_600_000,
      );
      const grams = this.gramsOfAlcohol(
        toNumber(drink.quantita),
        toNumber(drink.gradazione),
      );
      const peso = toNumber(account.peso);
      if (peso <= 0 || grams <= 0) {
        return total;
      }

      const multiplier = this.getSatietyMultiplierAt(foodLog, now);
      const peak = (grams / (r * peso)) * multiplier;
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
      data_consumo: formatLocalDate(now),
      consumato_il: formatLocalDateTime(now),
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
