import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CartService, Product} from '../../core/cart';
import { SessionService} from '../../core/session';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [
    { id: 'p1', name: 'Coca-Cola Lata 350ml', price: 5.00 },
    { id: 'p2', name: 'Água Mineral 500ml',   price: 3.00 },
    { id: 'p3', name: 'Suco de Laranja 300ml', price: 6.50 },
    { id: 'p4', name: 'Cerveja Long Neck',     price: 8.00 },
  ];

  key: string | null = null;

  constructor(
    public cart: CartService,
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.session.restore();
    this.key = this.session.shopKey();
    if (!this.key) this.router.navigateByUrl('/scan');
  }

  finish() {
    if (!this.key) {
      alert('Nenhuma chave associada. Volte ao scanner.');
      return;
    }
    const payload = {
      key: this.key,
      items: this.cart.items(),
      total: this.cart.totalPrice(),
    };
    console.log('pedido:', payload);
    alert(`pedido feito pra key ${this.key}! total: R$ ${this.cart.totalPrice().toFixed(2)}`);
    this.cart.clear();
    this.router.navigateByUrl('/scan');
  }
}
