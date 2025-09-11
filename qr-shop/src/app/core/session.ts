import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  shopKey = signal<string | null>(null);

  setKey(k: string) {
    this.shopKey.set(k);
    sessionStorage.setItem('shopKey', k);
  }

  restore() {
    const k = sessionStorage.getItem('shopKey');
    if (k) this.shopKey.set(k);
  }

  clear() {
    this.shopKey.set(null);
    sessionStorage.removeItem('shopKey');
  }
}
