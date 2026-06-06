import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Genere } from '../../models/account.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'register'>('login');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly showPassword = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    altezza: [175, [Validators.required, Validators.min(100), Validators.max(250)]],
    peso: [70, [Validators.required, Validators.min(40), Validators.max(300)]],
    genere: ['M' as Genere, Validators.required],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set(null);
    this.showPassword.set(false);
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  setGenere(genere: Genere): void {
    this.registerForm.controls.genere.setValue(genere);
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenziali non valide');
      },
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.createAccount(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.auth.login({
          login: this.registerForm.controls.email.value,
          password: this.registerForm.controls.password.value,
        }).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/home']);
          },
          error: () => {
            this.loading.set(false);
            this.error.set('Registrazione ok, ma login fallito. Prova ad accedere.');
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.error ?? 'Registrazione fallita (username o email già in uso?)',
        );
      },
    });
  }
}
