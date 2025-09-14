import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {SessionService} from '../../../core/session';
import {ApiService} from '../../../core/api-service';

@Component({
  standalone: true,
  selector: 'app-public-balance',
  imports: [CommonModule, FormsModule, MatButtonModule, DecimalPipe],
  templateUrl: './public-balance.html',
  styleUrls: ['./public-balance.scss']
})
export class PublicBalanceComponent {
  cardId = '';
  balance = 0;
  transactions: any[] = [];
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private session: SessionService,
    private router: Router
  ) {
    this.session.restore();
    const k = this.session.shopKey();
    if (k) { this.cardId = k; this.consult(); }
  }

  async consult() {
    if (!this.cardId) return;
    this.loading = true; this.error = '';
    try {
      const [b, tx] = await Promise.all([
        this.api.getBalance(this.cardId),
        this.api.getTransactions(this.cardId, { limit: 20 })
      ]);
      this.balance = b.balance ?? 0;
      this.transactions = tx.items ?? [];
      this.session.setKey(this.cardId);
    } catch {
      this.error = 'Não foi possível consultar.';
    } finally {
      this.loading = false;
    }
  }

  scan(){ this.router.navigateByUrl('/scan'); }
}
