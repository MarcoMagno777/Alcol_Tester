import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account, Genere } from '../../models/account.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly account = input.required<Account>();
  readonly closed = output<void>();
  readonly saved = output<Account>();

  readonly form = this.fb.nonNullable.group({
    altezza: [175, [Validators.required, Validators.min(100), Validators.max(250)]],
    peso: [70, [Validators.required, Validators.min(40), Validators.max(300)]],
    genere: ['M' as Genere, Validators.required],
  });

  message: string | null = null;

  constructor() {
    effect(() => {
      const acc = this.account();
      this.form.patchValue({
        altezza: acc.altezza,
        peso: acc.peso,
        genere: acc.genere,
      });
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const acc = this.account();
    this.api.updateAccount(acc.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.message = 'Profilo aggiornato';
        this.saved.emit({ ...acc, ...this.form.getRawValue() });
      },
      error: () => {
        this.message = 'Errore durante il salvataggio';
      },
    });
  }

  setGenere(genere: Genere): void {
    this.form.controls.genere.setValue(genere);
  }

  close(): void {
    this.closed.emit();
  }
}
