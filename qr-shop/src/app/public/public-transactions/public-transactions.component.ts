import {Component, inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardApiService } from '../../core/services/card-api.service';
import { NgFor, DatePipe, CurrencyPipe, NgIf, AsyncPipe } from '@angular/common';
import { catchError, map, startWith, switchMap, of } from 'rxjs';

type Tx = { id:string; date:string; amount:number; type:'add'|'subtract'; description:string|null };

@Component({
  standalone: true,
  selector: 'app-public-transactions',
  imports: [NgFor, NgIf, DatePipe, CurrencyPipe, AsyncPipe],
  template: `
    <div class="card" *ngIf="vm$ | async as vm">
      <h2>Transações</h2>
      <p class="muted">Card: {{ vm.cardId }}</p>

      <div *ngIf="vm.loading" class="muted">Carregando...</div>
      <div *ngIf="!vm.loading && !vm.txs.length && !vm.error" class="empty">Sem transações ainda.</div>
      <div *ngIf="vm.error" class="bad">{{ vm.error }}</div>

      <div class="list" *ngIf="!vm.loading && vm.txs.length">
        <div class="item" *ngFor="let t of vm.txs">
          <div class="left">
            <div class="desc">{{ t.description || '—' }}</div>
            <div class="date">{{ t.date | date:'short' }}</div>
          </div>
          <div class="right" [class.ok]="t.type==='add'" [class.bad]="t.type==='subtract'">
            {{ t.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles:[`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05)}
    .muted{color:#4A5568}
    .list{margin-top:12px;display:grid;gap:10px}
    .item{display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e2e8f0;border-radius:12px}
    .left .desc{font-weight:600}
    .left .date{color:#718096;font-size:12px}
    .right{font-weight:700}
    .empty{padding:24px;text-align:center;color:#718096}
  `]
})
export class PublicTransactionsComponent {
  constructor(private api: CardApiService) {}
  private route = inject(ActivatedRoute);

  vm$ = this.route.paramMap.pipe(
    map(p => decodeURIComponent(p.get('cardId') ?? '')),
    switchMap(cardId => {
      localStorage.setItem('lastCardId', cardId);

      return this.api.getTransactions(cardId).pipe(
        map((res: Tx[]) => ({ loading: false, txs: res ?? [], error: '', cardId })),
        catchError(err => of({
          loading: false,
          txs: [] as Tx[],
          error: (err?.error?.message || 'Erro ao carregar transações'),
          cardId
        })),
        startWith({ loading: true, txs: [] as Tx[], error: '', cardId })
      );
    })
  );
}
