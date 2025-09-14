import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {SessionService} from '../../core/session';
import {ApiService} from '../../core/api-service';

@Component({
  standalone: true,
  selector: 'app-debit-balance',
  imports: [CommonModule, FormsModule, MatButtonModule, MatSnackBarModule, DecimalPipe],
  templateUrl: './debit-balance.html',
  styleUrls: ['./debit-balance.scss']
})
export class DebitBalanceComponent {
  key: string | null;
  amount = 0;
  balance = 0;
  error = '';

  constructor(
    private session: SessionService,
    private api: ApiService,
    private snack: MatSnackBar
  ) {
    this.session.restore();
    this.key = this.session.shopKey();
    if (this.key) this.refresh();
  }

  async refresh() {
    if (!this.key) return;
    try { this.balance = (await this.api.getBalance(this.key)).balance ?? 0; }
    catch { this.balance = 0; }
  }

  async debit() {
    this.error = '';
    if (!this.key || this.amount <= 0) return;
    try {
      const res = await this.api.subtractBalance(this.key, this.amount);
      this.balance = res.newBalance ?? (this.balance - this.amount);
      this.amount = 0;
      this.snack.open('Débito realizado!', 'OK', { duration: 1500 });
    } catch {
      this.error = 'Valor maior que o saldo ou inválido.';
    }
  }
}
