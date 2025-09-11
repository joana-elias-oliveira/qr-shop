import { Injectable, signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // [{ product, qty }]
  private _items = signal<{ product: Product; qty: number }[]>([]);

  items() { return this._items(); }

  add(p: Product) {
    const arr = [...this._items()];
    const i = arr.findIndex(x => x.product.id === p.id);
    if (i >= 0) arr[i] = { ...arr[i], qty: arr[i].qty + 1 };
    else arr.push({ product: p, qty: 1 });
    this._items.set(arr);
  }

  decrement(p: Product) {
    const arr = [...this._items()];
    const i = arr.findIndex(x => x.product.id === p.id);
    if (i >= 0) {
      const n = arr[i].qty - 1;
      if (n <= 0) arr.splice(i, 1); else arr[i] = { ...arr[i], qty: n };
      this._items.set(arr);
    }
  }

  getQuantity(p: Product) {
    return this._items().find(i => i.product.id === p.id)?.qty ?? 0;
  }

  totalPrice() {
    return this._items().reduce((s, it) => s + it.qty * it.product.price, 0);
  }

  clear() { this._items.set([]); }
}
