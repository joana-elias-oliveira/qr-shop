import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { ProductService, Product } from '../../core/services/product.service';

@Component({
  standalone:true, selector:'app-product-catalog',
  imports:[NgFor],
  template:`
  <div class="card">
    <h2>Catálogo de Produtos</h2>
    <div *ngFor="let p of products" class="item">
      {{p.name}} — R$ {{p.price.toFixed(2)}}
      <button class="btn small" (click)="add(p)">Adicionar</button>
    </div>
    <h3>Carrinho:</h3>
    <div *ngFor="let c of cart">{{c.name}} - R$ {{c.price}}</div>
  </div>
  `,
  styles:[`.item{display:flex;justify-content:space-between;align-items:center;padding:4px 0}`]
})
export class ProductCatalogComponent {
  private svc=inject(ProductService);
  products:Product[]=this.svc.list();
  cart:Product[]=this.svc.getCart();
  add(p:Product){ this.svc.add(p); }
}
