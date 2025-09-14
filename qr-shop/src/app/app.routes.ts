import { Routes } from '@angular/router';
import { PublicBalanceComponent } from './features/public/public-balance/public-balance';
import { AdminLoginComponent } from './features/admin-login/admin-login';
import { DebitBalanceComponent } from './features/debit-balance/debit-balance';
import { adminGuard } from './core/admin.guard';
import {AdminLayoutComponent} from './admin/admin-layout/admin-layout';
import { AddBalanceComponent } from './features/add-balance/add-balance';
import {ProductsComponent} from './features/products/products';
import {LandingComponent} from './features/landing/landing';
import {ScannerComponent} from './features/scanner/scanner';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'scan', component: ScannerComponent },
  { path: 'saldo', component: PublicBalanceComponent },

  { path: 'admin/login', component: AdminLoginComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canMatch: [adminGuard],
    children: [
      { path: 'produtos', component: ProductsComponent },
      { path: 'saldo/adicionar', component: AddBalanceComponent },  // <-- aqui
      { path: 'saldo/debitar', component: DebitBalanceComponent },
      { path: '', pathMatch: 'full', redirectTo: 'produtos' },
    ],
  },

  { path: '**', redirectTo: '' }
];
