import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAdmin = signal<boolean>(false);

  login(pin: string): boolean {
    const ok = pin === 'recanto';
    this.isAdmin.set(ok);
    sessionStorage.setItem('isAdmin', ok ? '1' : '');
    return ok;
  }
  restore() { this.isAdmin.set(sessionStorage.getItem('isAdmin') === '1'); }
  logout() { this.isAdmin.set(false); sessionStorage.removeItem('isAdmin'); }
}
