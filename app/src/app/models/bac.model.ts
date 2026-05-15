export type BacZone = 'sobrio' | 'alticcio' | 'perfetta' | 'pericolo';

export interface BacZoneInfo {
  id: BacZone;
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface BacState {
  value: number;
  zone: BacZone;
  zoneLabel: string;
  timeToZero: Date | null;
  formattedCountdown: string;
}

export const BAC_ZONES: BacZoneInfo[] = [
  { id: 'sobrio', label: 'Sobrio', min: 0, max: 0.3, color: '#22c55e' },
  { id: 'alticcio', label: 'Alticcio', min: 0.3, max: 0.5, color: '#eab308' },
  { id: 'perfetta', label: 'Fase perfetta', min: 0.5, max: 0.8, color: '#f97316' },
  { id: 'pericolo', label: 'Pericolo', min: 0.8, max: 1.2, color: '#ef4444' },
];

export const BAC_BAR_MAX = 1.2;
