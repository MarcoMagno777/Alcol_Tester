import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { BAC_BAR_MAX } from '../../models/bac.model';
import { BacTimelinePoint } from '../../services/bac.service';

@Component({
  selector: 'app-bac-chart',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './bac-chart.component.html',
  styleUrl: './bac-chart.component.scss',
})
export class BacChartComponent {
  readonly points = input.required<BacTimelinePoint[]>();
  readonly now = input.required<Date>();

  readonly maxBac = BAC_BAR_MAX;

  readonly chart = computed(() => {
    const pts = this.points();
    if (pts.length < 2) {
      return null;
    }

    const width = 100;
    const height = 100;
    const padding = { top: 8, right: 4, bottom: 16, left: 4 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const tMin = pts[0].at.getTime();
    const tMax = pts[pts.length - 1].at.getTime();
    const tSpan = Math.max(tMax - tMin, 1);

    const yMax = Math.max(BAC_BAR_MAX, ...pts.map((p) => p.bac)) * 1.05;

    const coords = pts.map((p) => {
      const x = padding.left + ((p.at.getTime() - tMin) / tSpan) * innerW;
      const y = padding.top + innerH - (p.bac / yMax) * innerH;
      return { x, y, ...p };
    });

    const line = coords.map((c) => `${c.x},${c.y}`).join(' ');
    const area = [
      `${coords[0].x},${padding.top + innerH}`,
      ...coords.map((c) => `${c.x},${c.y}`),
      `${coords[coords.length - 1].x},${padding.top + innerH}`,
    ].join(' ');

    const nowMs = this.now().getTime();
    const nowX =
      padding.left +
      ((Math.min(Math.max(nowMs, tMin), tMax) - tMin) / tSpan) * innerW;

    const yTicks = [0, 0.3, 0.5, 0.8, 1.0].filter((v) => v <= yMax);

    const mid = Math.floor((coords.length - 1) / 2);
    const xLabelIndices = new Set([0, mid, coords.length - 1]);

    return {
      width,
      height,
      padding,
      innerH,
      line,
      area,
      coords,
      nowX,
      yMax,
      yTicks,
      xLabelIndices,
    };
  });
}
