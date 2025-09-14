import { Injectable } from '@angular/core';

export interface Product { name: string; price: number; }

@Injectable({ providedIn: 'root' })
export class ProductService {
  products: Product[] = [
    { name: 'Ração Premium 1kg', price: 25.00 },
    { name: 'Brinquedo Bola', price: 10.00 },
    { name: 'Coleira Ajustável', price: 18.50 },
  ];
  cart: Product[] = [];

  list(){ return this.products; }
  add(p:Product){ this.cart.push(p); }
  getCart(){ return this.cart; }
  clear(){ this.cart=[]; }
}
