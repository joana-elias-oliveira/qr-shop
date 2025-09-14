import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'saldo' },

  { path: 'saldo', loadComponent: () =>
      import('./features/public/public-balance/public-balance')
        .then(m => m.PublicBalanceComponent)
  },

  { path: 'scan', loadComponent: () =>
      import('./features/scanner/scanner')
        .then(m => m.ScannerComponent)
  },

  // Área restrita
  { path: 'admin/login', loadComponent: () =>
      import('./features/admin-login/admin-login')
        .then(m => m.AdminLoginComponent)
  },
  { path: 'admin/saldo/adicionar', loadComponent: () =>
      import('./features/add-balance/add-balance')
        .then(m => m.AddBalanceComponent)
  },
  { path: 'admin/saldo/debitar', loadComponent: () =>
      import('./features/debit-balance/debit-balance')
        .then(m => m.DebitBalanceComponent)
  },

  { path: '**', redirectTo: 'saldo' }
];
