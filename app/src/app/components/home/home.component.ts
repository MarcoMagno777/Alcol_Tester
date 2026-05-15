import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Account } from '../../models/account.model';
import { AccountAlcolEntry, AlcolCatalogItem } from '../../models/alcol.model';
import { AccountSazietaEntry } from '../../models/sazieta.model';
import { AccountComponent } from '../account/account.component';
import { BacBarComponent } from '../bac-bar/bac-bar.component';
import { DrinkComponent } from '../drink/drink.component';
import { FoodComponent } from '../food/food.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BacService } from '../../services/bac.service';

@Component({
  selector: 'app-home',
  imports: [
    DecimalPipe,
    AccountComponent,
    BacBarComponent,
    DrinkComponent,
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

  readonly account = signal<Account | null>(null);
  readonly drinks = signal<AccountAlcolEntry[]>([]);
  readonly foodLog = signal<AccountSazietaEntry[]>([]);
  readonly previewDrink = signal<AlcolCatalogItem | null>(null);
  readonly showAccount = signal(false);
  readonly now = signal(new Date());

  readonly currentBac = computed(() => {
    const account = this.account();
    if (!account) {
      return 0;
    }

    return this.bacService.calculateState(
      account,
      this.drinks(),
      this.foodLog(),
      this.now(),
    ).value;
  });

  readonly previewBac = computed(() => {
    const account = this.account();
    const preview = this.previewDrink();
    if (!account || !preview) {
      return null;
    }

    return this.bacService.getPreviewValue(
      account,
      this.drinks(),
      this.foodLog(),
      preview,
      this.now(),
    );
  });

  readonly bacInfo = computed(() => {
    const account = this.account();
    if (!account) {
      return null;
    }

    return this.bacService.calculateState(
      account,
      this.drinks(),
      this.foodLog(),
      this.now(),
    );
  });

  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const userId = this.auth.userId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loadData(userId);
    this.timerId = setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  openAccount(): void {
    this.showAccount.set(true);
  }

  closeAccount(): void {
    this.showAccount.set(false);
  }

  onAccountSaved(account: Account): void {
    this.account.set(account);
  }

  onPreviewDrink(drink: AlcolCatalogItem | null): void {
    this.previewDrink.set(drink);
  }

  onDataChanged(): void {
    const userId = this.auth.userId();
    if (userId) {
      this.loadData(userId);
    }
    this.previewDrink.set(null);
  }

  logout(): void {
    this.auth.logout();
  }

  private loadData(userId: number): void {
    forkJoin({
      account: this.api.getAccount(userId),
      drinks: this.api.getAccountAlcol(userId),
      food: this.api.getAccountSazieta(userId),
    }).subscribe({
      next: ({ account, drinks, food }) => {
        this.account.set(account);
        this.drinks.set(drinks);
        this.foodLog.set(food);
      },
    });
  }
}
