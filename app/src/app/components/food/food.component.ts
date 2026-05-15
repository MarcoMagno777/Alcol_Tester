import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SazietaCatalogItem } from '../../models/sazieta.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-food',
  imports: [FormsModule],
  templateUrl: './food.component.html',
  styleUrl: './food.component.scss',
})
export class FoodComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly accountId = input.required<number>();
  readonly added = output<void>();

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
    const item = this.catalog().find((c) => c.id === this.selectedId);
    return item?.descrizione ?? '';
  }

  confirm(): void {
    if (!this.selectedId) {
      return;
    }

    const now = new Date();
    this.loading = true;
    this.message = null;

    this.api
      .addSazieta({
        account_id: this.accountId(),
        stato_sazieta_id: this.selectedId,
        data_consumo: now.toISOString().slice(0, 10),
        consumato_il: now.toISOString().slice(0, 19).replace('T', ' '),
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Pasto registrato';
          this.selectedId = null;
          this.added.emit();
        },
        error: () => {
          this.loading = false;
          this.message = 'Errore inserimento cibo';
        },
      });
  }
}
