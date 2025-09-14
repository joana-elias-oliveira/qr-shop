import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardApiService } from '../../../core/services/card-api.service';
import { FormsModule } from '@angular/forms';
import { NgFor, CurrencyPipe, NgIf } from '@angular/common';

type Product = { productName:string; unitPrice:number; quantity:number };

@Component({
  standalone:true, selector:'app-checkout', imports:[FormsModule, NgFor, CurrencyPipe, NgIf],
  template:`
  <div class="card">
    <h2>Checkout</h2>
    <p class="muted">Card: {{cardId}}</p>

    <!-- Catálogo fixo -->
    <div class="catalog">
      <h3>Produtos</h3>
      <div class="grid">
        <div class="item" *ngFor="let c of catalog">
          <div class="name">{{ c.productName }}</div>
          <div class="price">{{ c.unitPrice | currency:'BRL' }}</div>
          <div class="qty">
            <button class="btn" (click)="dec(c)">-</button>
            <input type="number" min="0" [ngModel]="c.quantity" (ngModelChange)="setQty(c, $event)" />
            <button class="btn" (click)="inc(c)">+</button>
          </div>
          <button class="btn primary" (click)="addToCart(c)">Adicionar</button>
        </div>
      </div>
    </div>

    <!-- Carrinho -->
    <div class="cart">
      <h3>Carrinho</h3>
      <div *ngIf="!products.length" class="muted">Nenhum item no carrinho.</div>
      <div class="row" *ngFor="let p of products; let i = index">
        <div style="flex:2">{{p.productName}}</div>
        <div style="flex:1">{{p.unitPrice | currency:'BRL'}}</div>
        <div style="flex:1"><input type="number" min="1" [(ngModel)]="p.quantity" (ngModelChange)="update()" /></div>
        <div style="flex:1">{{ (p.unitPrice * p.quantity) | currency:'BRL' }}</div>
        <div style="flex:0"><button class="btn" (click)="remove(i)">✕</button></div>
      </div>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      <button class="btn" (click)="previewCheckout()">Calcular total</button>
      <button class="btn primary" (click)="doCheckout()" [disabled]="!products.length">Finalizar</button>
      <button class="btn ghost" (click)="verTransacoes()">Ver transações</button>
      <button class="btn" (click)="voltar()">Voltar</button>
    </div>

    <div *ngIf="preview" class="ok" style="margin-top:8px">
      Total: {{ preview.totalAmount | currency:'BRL' }} • Saldo: {{ preview.balance | currency:'BRL' }}
      <span *ngIf="preview.sufficientBalance">✔ saldo suficiente</span>
      <span *ngIf="!preview.sufficientBalance" class="bad">✖ saldo insuficiente</span>
    </div>
    <div *ngIf="result!==null" class="ok">Novo saldo: {{ result | currency:'BRL' }}</div>
    <div *ngIf="error" class="bad">{{ error }}</div>
  </div>
  `,
  styles:[`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05);display:grid;gap:12px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
    .item{border:1px solid #e2e8f0;border-radius:12px;padding:12px;display:grid;gap:8px}
    .item .name{font-weight:600}
    .item .qty{display:flex;gap:8px;align-items:center}
    .item input{width:64px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:10px}
    .row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;align-items:center;border-bottom:1px dashed #e2e8f0;padding:6px 0}
  `]
})
export class CheckoutComponent {
  private route = inject(ActivatedRoute);
  private api = inject(CardApiService);
  private router = inject(Router);

  cardId = decodeURIComponent(this.route.snapshot.paramMap.get('cardId') || '');

  // catálogo fixo
  catalog: Product[] = [
    { productName:'Ração Premium 1kg', unitPrice: 32.90, quantity: 1 },
    { productName:'Ração Premium 3kg', unitPrice: 84.50, quantity: 1 },
    { productName:'Sachê Gourmet 85g', unitPrice: 5.90, quantity: 1 },
    { productName:'Brinquedo Bola', unitPrice: 12.00, quantity: 1 },
    { productName:'Coleira Ajustável', unitPrice: 19.90, quantity: 1 },
    { productName:'Areia Higiênica 4kg', unitPrice: 29.90, quantity: 1 },
  ];

  products: Product[] = [];
  preview?: { totalAmount:number; balance:number; sufficientBalance:boolean };
  result: number|null = null;
  error = '';

  inc(c: Product){ c.quantity++; }
  dec(c: Product){ if(c.quantity>1) c.quantity--; }
  setQty(c: Product, v: any){ const n = Math.max(1, Number(v)||1); c.quantity = n; }

  addToCart(c: Product){
    const existing = this.products.find(p => p.productName === c.productName && p.unitPrice === c.unitPrice);
    if(existing) existing.quantity += c.quantity;
    else this.products.push({ productName:c.productName, unitPrice:c.unitPrice, quantity:c.quantity });
    this.update();
  }

  remove(i: number){ this.products.splice(i,1); this.update(); }
  update(){ this.preview = undefined; this.result = null; this.error=''; }

  previewCheckout(){
    this.error=''; this.result = null;
    this.api.checkoutPreview(this.cardId, this.products).subscribe({
      next: r => this.preview = r,
      error: e => this.error = e?.error?.message || 'Erro ao calcular total',
    });
  }

  doCheckout(){
    this.error = ''; this.result = null;
    this.api.checkout(this.cardId, this.products).subscribe({
      next: r => { this.result = r.newBalance; this.products = []; this.preview = undefined; },
      error: e => this.error = e?.error?.message || 'Erro ao finalizar compra',
    });
  }

  verTransacoes(){ this.router.navigate(['/transactions', encodeURIComponent(this.cardId)]); }
  voltar(){ this.router.navigate(['/restricted/scan']); }
}
