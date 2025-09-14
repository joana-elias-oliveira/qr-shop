import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-public-home',
  imports: [FormsModule],
  template: `
  <div class="card">
    <h2>Consultar Cartão</h2>
    <p class="muted">Digite o <b>Card ID</b> para ver saldo e transações.</p>
    <input [(ngModel)]="cardId" placeholder="Ex: RMV-123-ABC" (keyup.enter)="go()" />
    <div class="row">
      <button class="btn primary" (click)="goBalance()">Ver Saldo</button>
      <button class="btn ghost" (click)="goTransactions()">Transações</button>
    </div>
  </div>
  `,
  styles:[`
    .card { background:#fff; padding:16px; border-radius:16px; box-shadow:0 6px 20px rgba(0,0,0,.05); display:grid; gap:12px; }
    input{padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px;font-size:16px}
    .row{display:flex; gap:8px; flex-wrap:wrap}
  `]
})
export class PublicHomeComponent {
  cardId = localStorage.getItem('lastCardId') ?? '';
  constructor(private router: Router) {}
  private save() { localStorage.setItem('lastCardId', this.cardId.trim()); }
  go(){ if(!this.cardId.trim()) return; this.save(); this.goBalance(); }
  goBalance(){ this.router.navigate(['/balance', encodeURIComponent(this.cardId.trim())]); }
  goTransactions(){ this.router.navigate(['/transactions', encodeURIComponent(this.cardId.trim())]); }
}
