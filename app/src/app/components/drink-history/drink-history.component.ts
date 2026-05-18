import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { AccountAlcolEntry } from '../../models/alcol.model';
import { parseDateTime } from '../../utils/api-mapper';

@Component({
  selector: 'app-drink-history',
  imports: [DatePipe],
  templateUrl: './drink-history.component.html',
  styleUrl: './drink-history.component.scss',
})
export class DrinkHistoryComponent {
  readonly drinks = input.required<AccountAlcolEntry[]>();

  drinkTime(entry: AccountAlcolEntry): Date {
    return parseDateTime(entry.consumato_il);
  }
}
