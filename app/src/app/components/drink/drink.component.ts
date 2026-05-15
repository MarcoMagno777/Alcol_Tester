import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlcolCatalogItem } from '../../models/alcol.model';
import { ApiService } from '../../services/api.service';

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
  readonly added = output<void>();

  readonly catalog = signal<AlcolCatalogItem[]>([]);
  selectedId: number | null = null;
  loading = false;
  message: string | null = null;

  ngOnInit(): void {
    this.api.getAlcolCatalog().subscribe({
      next: (items) => this.catalog.set(items),
    });
  }

  onSelectChange(): void {
    const drink = this.catalog().find((d) => d.id === this.selectedId) ?? null;
    this.preview.emit(drink);
  }

  confirm(): void {
    if (!this.selectedId) {
      return;
    }

    const now = new Date();
    this.loading = true;
    this.message = null;

    this.api
      .addAlcol({
        account_id: this.accountId(),
        alcol_id: this.selectedId,
        data_consumo: now.toISOString().slice(0, 10),
        consumato_il: now.toISOString().slice(0, 19).replace('T', ' '),
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Drink registrato';
          this.selectedId = null;
          this.preview.emit(null);
          this.added.emit();
        },
        error: () => {
          this.loading = false;
          this.message = 'Errore inserimento drink';
        },
      });
  }
}
