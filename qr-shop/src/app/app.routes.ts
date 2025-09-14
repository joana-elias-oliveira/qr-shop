import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout';
import { RestrictedLayoutComponent } from './layouts/restricted-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'scan' },
      { path: 'scan', loadComponent: () => import('./public/public-scan/public-scan.component').then(m => m.PublicScanComponent) },
      { path: 'balance/:cardId', loadComponent: () => import('./public/public-balance/public-balance.component').then(m => m.PublicBalanceComponent) },
      { path: 'transactions/:cardId', loadComponent: () => import('./public/public-transactions/public-transactions.component').then(m => m.PublicTransactionsComponent) },
    ],
  },
  {
    path: 'restricted',
    component: RestrictedLayoutComponent,
    children: [
      { path: '', redirectTo: 'scan', pathMatch: 'full' },
      { path: 'scan', loadComponent: () => import('./restricted/scan/scan.component').then(m => m.RestrictedScanComponent) },
      { path: 'login', loadComponent: () => import('./restricted/auth/api-key-login/api-key-login.component').then(m => m.ApiKeyLoginComponent) },
      { path: 'add-balance/:cardId', loadComponent: () => import('./restricted/actions/add-balance/add-balance.component').then(m => m.AddBalanceComponent) },
      { path: 'checkout/:cardId', loadComponent: () => import('./restricted/actions/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'assign/:cardId', loadComponent: () => import('./restricted/actions/assign-card/assign-card.component').then(m => m.AssignCardComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
