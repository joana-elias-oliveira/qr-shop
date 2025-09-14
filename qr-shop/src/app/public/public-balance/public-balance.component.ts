import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardApiService } from '../../core/services/card-api.service';
import { CurrencyPipe, NgIf } from '@angular/common';
import QRCode from 'qrcode';

@Component({
  standalone: true,
  selector: 'app-public-balance',
  imports: [CurrencyPipe, NgIf],
  template: `
  <div class="card">
    <h2>Saldo</h2>
    <p class="muted">Card: {{cardId}}</p>
    <h1 class="money" *ngIf="balance !== null">{{ balance | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</h1>
    <div *ngIf="balance === null" class="muted">Carregando...</div>
    <canvas id="qrCanvas"></canvas>
  </div>
  `,
  styles:[`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05)}
    .money{font-size:32px;margin:8px 0 16px}
    .muted{color:#4A5568}
  `]
})
export class PublicBalanceComponent {
  private route = inject(ActivatedRoute);
  private api = inject(CardApiService);
  cardId = ''; balance: number | null = null;

  ngOnInit(){
    this.route.paramMap.subscribe(p => {
      const id = decodeURIComponent(p.get('cardId') ?? '');
      this.cardId = id;
      localStorage.setItem('lastCardId', id);
      this.balance = null;
      this.api.getBalance(id).subscribe(res => this.balance = res.balance);
      setTimeout(()=>this.renderQR(), 0);
    });
  }

  async renderQR(){
    const canvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
    if (canvas && this.cardId) {
      await QRCode.toCanvas(canvas, this.cardId, { margin: 1, width: 220 });
    }
  }
}
