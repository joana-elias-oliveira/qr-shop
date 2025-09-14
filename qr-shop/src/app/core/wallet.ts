// src/app/core/wallet.service.ts  (opção: renomeie para .service.ts)
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private map = new Map<string, number>();

  getBalance(key: string) {
    return this.map.get(key) ?? 0;
  }

  add(key: string, amount: number) {
    this.map.set(key, this.getBalance(key) + amount);
  }

  debit(key: string, amount: number): boolean {
    const cur = this.getBalance(key);
    if (amount > cur) return false;
    this.map.set(key, cur - amount);
    return true;
  }
}
