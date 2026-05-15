import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  { path: '**', redirectTo: 'auth' },
];
