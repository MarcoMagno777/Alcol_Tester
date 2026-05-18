import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { BAC_BAR_MAX, BAC_ZONES } from '../../models/bac.model';
import { BacService } from '../../services/bac.service';

@Component({
  selector: 'app-bac-bar',
  imports: [DecimalPipe],
  templateUrl: './bac-bar.component.html',
  styleUrl: './bac-bar.component.scss',
})
export class BacBarComponent {
  private readonly bacService = inject(BacService);

  readonly currentBac = input.required<number>();
  readonly previewBac = input<number | null>(null);
  readonly zoneLabel = input.required<string>();
  readonly dataVersion = input(0);

  readonly zones = BAC_ZONES;

  readonly isPreview = computed(() => this.previewBac() !== null);

  /** Posizione del puntino: anteprima drink se selezionato, altrimenti BAC corrente. */
  readonly markerPercent = computed(() => {
    this.dataVersion();
    const preview = this.previewBac();
    const bac = preview !== null ? preview : this.currentBac();
    return this.bacService.getBarPercent(bac);
  });

  readonly markerLabel = computed(() => {
    if (this.isPreview()) {
      return 'Anteprima con drink selezionato';
    }
    return `Stato attuale: ${this.zoneLabel()}`;
  });

  zoneWidth(zone: (typeof BAC_ZONES)[number]): number {
    return ((zone.max - zone.min) / BAC_BAR_MAX) * 100;
  }
}
