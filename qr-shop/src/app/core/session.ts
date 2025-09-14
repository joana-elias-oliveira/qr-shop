import { Injectable } from '@angular/core';

const KEY = 'qrshop.cardId';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _key: string | null = null;

  restore() {
    if (this._key == null) this._key = localStorage.getItem(KEY);
  }
  setKey(k: string) {
    this._key = k;
    localStorage.setItem(KEY, k);
  }
  clearKey() {
    this._key = null;
    localStorage.removeItem(KEY);
  }
  shopKey() { return this._key; }
}
