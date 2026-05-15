import { Component, computed, inject, input } from '@angular/core';
import { BAC_BAR_MAX, BAC_ZONES } from '../../models/bac.model';
import { BacService } from '../../services/bac.service';

@Component({
  selector: 'app-bac-bar',
  templateUrl: './bac-bar.component.html',
  styleUrl: './bac-bar.component.scss',
})
export class BacBarComponent {
  private readonly bacService = inject(BacService);

  readonly currentBac = input.required<number>();
  readonly previewBac = input<number | null>(null);
  readonly zoneLabel = input.required<string>();

  readonly zones = BAC_ZONES;
  readonly maxBac = BAC_BAR_MAX;

  readonly currentPercent = computed(() =>
    this.bacService.getBarPercent(this.currentBac()),
  );

  readonly previewPercent = computed(() => {
    const preview = this.previewBac();
    return preview === null ? null : this.bacService.getBarPercent(preview);
  });

  zoneWidth(zone: (typeof BAC_ZONES)[number]): number {
    return ((zone.max - zone.min) / BAC_BAR_MAX) * 100;
  }
}
