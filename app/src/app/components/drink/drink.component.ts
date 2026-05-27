import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlcolCatalogItem } from '../../models/alcol.model';
import { ApiService } from '../../services/api.service';
import { formatLocalDate, formatLocalDateTime, toNumber } from '../../utils/api-mapper';

@Component({
  selector: 'app-drink',
  imports: [FormsModule],
  templateUrl: './drink.component.html',
  styleUrl: './drink.component.scss',
})
export class DrinkComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly accountId = input.required<number>();
  readonly preview = output<AlcolCatalogItem | null>();
  readonly added = output<AlcolCatalogItem>();

  readonly catalog = signal<AlcolCatalogItem[]>([]);
  selectedId: number | null = null;
  loading = false;
  message: string | null = null;
  searchText = '';

  ngOnInit(): void {
    this.api.getAlcolCatalog().subscribe({
      next: (items) => this.catalog.set(items),
    });
  }

  filteredCatalog(): AlcolCatalogItem[] {
    const q = this.searchText?.trim().toLowerCase();
    if (!q) {
      return this.catalog();
    }
    return this.catalog().filter((d) => {
      const name = (d.nome || '').toString().toLowerCase();
      const grad = d.gradazione != null ? d.gradazione.toString().toLowerCase() : '';
      const quant = d.quantita != null ? d.quantita.toString().toLowerCase() : '';
      return name.includes(q) || grad.includes(q) || quant.includes(q);
    });
  }

  onSelectChange(value: number | null): void {
    if (value === null) {
      this.preview.emit(null);
      return;
    }

    const id = toNumber(value);
    const drink = this.catalog().find((d) => d.id === id) ?? null;
    this.preview.emit(drink);
  }

  confirm(): void {
    const alcolId = this.selectedAlcolId();
    if (!alcolId) {
      return;
    }

    const drink = this.catalog().find((d) => d.id === alcolId);
    if (!drink) {
      return;
    }

    const now = new Date();
    this.loading = true;
    this.message = null;

    this.api
      .addAlcol({
        account_id: toNumber(this.accountId()),
        alcol_id: alcolId,
        data_consumo: formatLocalDate(now),
        consumato_il: formatLocalDateTime(now),
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Drink registrato';
          this.selectedId = null;
          this.preview.emit(null);
          this.added.emit(drink);
        },
        error: () => {
          this.loading = false;
          this.message = 'Errore inserimento drink';
        },
      });
  }

  private selectedAlcolId(): number | null {
    if (this.selectedId === null || this.selectedId === undefined) {
      return null;
    }
    const id = toNumber(this.selectedId);
    return id > 0 ? id : null;
  }
}
