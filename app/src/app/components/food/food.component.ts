import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountSazietaEntry, SazietaCatalogItem } from '../../models/sazieta.model';
import { ApiService } from '../../services/api.service';
import { formatLocalDate, formatLocalDateTime, toNumber } from '../../utils/api-mapper';

@Component({
  selector: 'app-food',
  imports: [FormsModule],
  templateUrl: './food.component.html',
  styleUrl: './food.component.scss',
})
export class FoodComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly accountId = input.required<number>();
  readonly added = output<AccountSazietaEntry>();

  readonly catalog = signal<SazietaCatalogItem[]>([]);
  selectedId: number | null = null;
  loading = false;
  message: string | null = null;

  ngOnInit(): void {
    this.api.getSazietaCatalog().subscribe({
      next: (items) => this.catalog.set(items),
    });
  }

  selectedDescription(): string {
    const id = this.selectedStatoId();
    const item = this.catalog().find((c) => c.id === id);
    return item?.descrizione ?? '';
  }

  confirm(): void {
    const statoId = this.selectedStatoId();
    if (!statoId) {
      return;
    }

    const item = this.catalog().find((c) => c.id === statoId);
    if (!item) {
      return;
    }

    const now = new Date();
    this.loading = true;
    this.message = null;

    this.api
      .addSazieta({
        account_id: toNumber(this.accountId()),
        stato_sazieta_id: statoId,
        data_consumo: formatLocalDate(now),
        consumato_il: formatLocalDateTime(now),
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Pasto registrato';
          this.selectedId = null;

          const entry: AccountSazietaEntry = {
            id: -Date.now(),
            stato_sazieta_id: item.id,
            data_consumo: formatLocalDate(now),
            consumato_il: formatLocalDateTime(now),
            nome: item.nome,
            descrizione: item.descrizione,
          };
          this.added.emit(entry);
        },
        error: () => {
          this.loading = false;
          this.message = 'Errore inserimento cibo';
        },
      });
  }

  private selectedStatoId(): number | null {
    if (this.selectedId === null || this.selectedId === undefined) {
      return null;
    }
    const id = toNumber(this.selectedId);
    return id > 0 ? id : null;
  }
}
