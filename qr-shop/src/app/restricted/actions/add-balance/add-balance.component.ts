import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardApiService } from '../../../core/services/card-api.service';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, NgIf } from '@angular/common';

@Component({
  standalone:true, selector:'app-add-balance', imports:[FormsModule, CurrencyPipe, NgIf],
  template:`
  <div class="card">
    <h2>Adicionar saldo</h2>
    <p class="muted">Card: {{cardId}}</p>
    <input type="number" [(ngModel)]="amount" min="0.01" step="0.01" placeholder="Valor em R$" />
    <div class="row">
      <button class="btn primary" (click)="submit()">Adicionar</button>
      <button class="btn ghost" (click)="verSaldo()" [disabled]="lastResult===null">Ver saldo</button>
    </div>
    <div *ngIf="lastResult !== null" class="ok">Novo saldo: {{ lastResult | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
    <div *ngIf="error" class="bad">{{ error }}</div>
  </div>
  `,
  styles:[`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05);display:grid;gap:12px}
    input{padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px}
    .row{display:flex;gap:8px;flex-wrap:wrap}
  `]
})
export class AddBalanceComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CardApiService);
  cardId = decodeURIComponent(this.route.snapshot.paramMap.get('cardId') ?? '');
  amount = 0;
  lastResult: number | null = null; error?: string;

  submit(){
    this.error = undefined; this.lastResult = null;
    this.api.addBalance(this.cardId, Number(this.amount))
      .subscribe({
        next: r => { this.lastResult = r.newBalance; },
        error: e => this.error = e?.error?.message || 'Erro ao adicionar saldo',
      });
  }
  verSaldo(){ this.router.navigate(['/balance', encodeURIComponent(this.cardId)]); }
}
