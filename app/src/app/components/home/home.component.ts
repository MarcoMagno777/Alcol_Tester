import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Account } from '../../models/account.model';
import { AccountAlcolEntry, AlcolCatalogItem } from '../../models/alcol.model';
import { AccountSazietaEntry } from '../../models/sazieta.model';

import { AccountComponent } from '../account/account.component';
import { BacBarComponent } from '../bac-bar/bac-bar.component';
import { BacChartComponent } from '../bac-chart/bac-chart.component';
import { DrinkComponent } from '../drink/drink.component';
import { DrinkHistoryComponent } from '../drink-history/drink-history.component';
import { FoodComponent } from '../food/food.component';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BacService } from '../../services/bac.service';
import { formatLocalDate, formatLocalDateTime } from '../../utils/api-mapper';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    AccountComponent,
    BacBarComponent,
    BacChartComponent,
    DrinkComponent,
    DrinkHistoryComponent,
    FoodComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly bacService = inject(BacService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  readonly account = signal<Account | null>(null);
  readonly drinks = signal<AccountAlcolEntry[]>([]);
  readonly foodLog = signal<AccountSazietaEntry[]>([]);
  readonly previewDrink = signal<AlcolCatalogItem | null>(null);
  readonly showAccount = signal(false);
  readonly now = signal(new Date());
  readonly dataVersion = signal(0);

  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly resetting = signal(false);

  readonly currentBac = computed(() => {
    this.dataVersion();
    const account = this.account();
    if (!account) return 0;

    return this.bacService.calculateBac(
      account,
      this.drinks(),
      this.foodLog(),
      this.now(),
    );
  });

  readonly previewBac = computed(() => {
    this.dataVersion();
    const account = this.account();
    const preview = this.previewDrink();
    if (!account || !preview) return null;

    return this.bacService.getPreviewValue(
      account,
      this.drinks(),
      this.foodLog(),
      preview,
      this.now(),
    );
  });

  readonly bacInfo = computed(() => {
    this.dataVersion();
    const account = this.account();
    if (!account) return null;

    return this.bacService.calculateState(
      account,
      this.drinks(),
      this.foodLog(),
      this.now(),
    );
  });

  readonly satietyInfo = computed(() => {
    this.dataVersion();
    return this.bacService.getCurrentSatiety(this.foodLog(), this.now());
  });

  readonly bacTimeline = computed(() => {
    this.dataVersion();
    const account = this.account();
    if (!account) return [];

    return this.bacService.getTimeline(
      account,
      this.drinks(),
      this.foodLog(),
      this.now(),
    );
  });

  private timerId: ReturnType<typeof setInterval> | null = null;
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const userId = this.auth.userId();

    if (!userId) {
      this.loading.set(false);
      this.router.navigate(['/auth']);
      return;
    }

    this.loadData(userId, true);

    this.timerId = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private loadData(userId: number, initial = false): void {
    if (initial) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }
    this.error.set(null);

    forkJoin({
      account: this.api.getAccount(userId),
      drinks: this.api.getAccountAlcol(userId),
      food: this.api.getAccountSazieta(userId),
    }).subscribe({
      next: ({ account, drinks, food }) => {
        this.applyLogs(account, drinks, food);
        this.loading.set(false);
        this.refreshing.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.refreshing.set(false);
        this.error.set('Errore nel caricamento dati');
      },
    });
  }

  private applyLogs(
    account: Account,
    drinks: AccountAlcolEntry[],
    food: AccountSazietaEntry[],
  ): void {
    this.ngZone.run(() => {
      this.account.set(account);
      this.drinks.set([...drinks]);
      this.foodLog.set([...food]);
      this.dataVersion.update((v) => v + 1);
    });
  }

  openAccount(): void {
    this.showAccount.set(true);
  }

  closeAccount(): void {
    this.showAccount.set(false);
  }

  onAccountSaved(account: Account): void {
    this.account.set(account);
    this.dataVersion.update((v) => v + 1);
  }

  onPreviewDrink(drink: AlcolCatalogItem | null): void {
    this.previewDrink.set(drink);
  }

  onDrinkAdded(item: AlcolCatalogItem): void {
    this.previewDrink.set(null);
    const now = new Date();
    const optimistic: AccountAlcolEntry = {
      id: -Date.now(),
      alcol_id: item.id,
      data_consumo: formatLocalDate(now),
      consumato_il: formatLocalDateTime(now),
      nome: item.nome,
      quantita: item.quantita,
      gradazione: item.gradazione,
    };
    this.drinks.update((list) => [optimistic, ...list]);
    this.dataVersion.update((v) => v + 1);
    this.refreshLogs();
  }

  onFoodAdded(entry: AccountSazietaEntry): void {
    this.foodLog.update((list) => [entry, ...list]);
    this.dataVersion.update((v) => v + 1);
    this.refreshLogs();
  }

  private refreshLogs(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    this.refreshing.set(true);

    forkJoin({
      drinks: this.api.getAccountAlcol(userId),
      food: this.api.getAccountSazieta(userId),
    }).subscribe({
      next: ({ drinks, food }) => {
        const account = this.account();
        if (account) {
          this.applyLogs(account, drinks, food);
        } else {
          this.drinks.set([...drinks]);
          this.foodLog.set([...food]);
          this.dataVersion.update((v) => v + 1);
        }
        this.refreshing.set(false);
      },
      error: () => {
        this.refreshing.set(false);
        this.error.set('Errore aggiornamento dati');
      },
    });
  }

  resetSession(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    const confirmed = confirm(
      'Vuoi azzerare la sessione?\n\nVerranno eliminati tutti i drink e i pasti registrati. Il profilo account resta invariato.',
    );
    if (!confirmed) return;

    this.resetting.set(true);
    this.error.set(null);

    this.api.resetSession(userId).subscribe({
      next: () => {
        this.previewDrink.set(null);
        this.drinks.set([]);
        this.foodLog.set([]);
        this.dataVersion.update((v) => v + 1);
        this.resetting.set(false);
      },
      error: () => {
        this.resetting.set(false);
        this.error.set('Errore durante il reset della sessione');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
