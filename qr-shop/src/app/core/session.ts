import { Injectable, signal } from '@angular/core';

const KEY = 'qr-shop-key';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _shopKey = signal<string | null>(null);
  shopKey = this._shopKey.asReadonly();

  setShopKey(key: string) {
    this._shopKey.set(key);
    localStorage.setItem(KEY, key);
  }
  // alias pro seu código atual:
  setKey(key: string) { this.setShopKey(key); }

  clear() {
    this._shopKey.set(null);
    localStorage.removeItem(KEY);
  }

  restore() {
    const k = localStorage.getItem(KEY);
    if (k) this._shopKey.set(k);
  }
}
