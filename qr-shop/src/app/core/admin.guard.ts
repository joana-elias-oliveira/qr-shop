import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService} from './auth';

export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  auth.restore();
  if (auth.isAdmin()) return true;
  router.navigateByUrl('/admin/login');
  return false;
};
2
