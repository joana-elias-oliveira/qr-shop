import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WalletService {
  // dicionário de saldos por chave
  private store = signal<Record<string, number>>({});

  /** consulta saldo de uma chave */
  getBalance(key: string): number {
    return this.store()[key] ?? 0;
  }

  /** adiciona valor ao saldo */
  add(key: string, amount: number) {
    const current = this.getBalance(key);
    this.store.update(s => ({ ...s, [key]: current + amount }));
  }

  /** debita valor (se saldo suficiente) */
  debit(key: string, amount: number): boolean {
    const current = this.getBalance(key);
    if (current < amount) return false;
    this.store.update(s => ({ ...s, [key]: current - amount }));
    return true;
  }
}
