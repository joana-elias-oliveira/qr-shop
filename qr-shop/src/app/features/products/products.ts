import {Component, computed} from '@angular/core';
import {CartService, Product} from '../../core/cart';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Produto A', price: 10 },
  { id: 'p2', name: 'Produto B', price: 15 },
  { id: 'p3', name: 'Produto C', price: 20 },
  { id: 'p4', name: 'Produto D', price: 8 },
  { id: 'p5', name: 'Produto E', price: 12 },
];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class ProductsComponent {
  products: Product[] = PRODUCTS;
  constructor(private cart: CartService) {}

  add(p: Product){ this.cart.add(p); }
  dec(p: Product){ this.cart.remove(p); }
  qty(p: Product){ return this.cart.items().find(i => i.product.id===p.id)?.qty ?? 0; }

  totalItems = computed(() => this.cart.totalItems());
  totalPrice = computed(() => this.cart.totalPrice());

  finish() {
    alert(`pedido feito! total: R$ ${this.totalPrice().toFixed(2)}`);
    this.cart.clear();
  }
}
