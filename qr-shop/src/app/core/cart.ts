import { Injectable, signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<{ product: Product; qty: number }[]>([]);

  add(p: Product) {
    const arr = this.items();
    const i = arr.findIndex(x => x.product.id === p.id);
    if (i >= 0) arr[i] = { ...arr[i], qty: arr[i].qty + 1 };
    else arr.push({ product: p, qty: 1 });
    this.items.set([...arr]);
  }

  remove(p: Product) {
    const arr = this.items();
    const i = arr.findIndex(x => x.product.id === p.id);
    if (i >= 0) {
      const n = arr[i].qty - 1;
      n <= 0 ? arr.splice(i, 1) : arr[i] = { ...arr[i], qty: n };
      this.items.set([...arr]);
    }
  }

  clear() { this.items.set([]); }

  totalItems() { return this.items().reduce((s, it) => s + it.qty, 0); }
  totalPrice() { return this.items().reduce((s, it) => s + it.qty * it.product.price, 0); }
}
