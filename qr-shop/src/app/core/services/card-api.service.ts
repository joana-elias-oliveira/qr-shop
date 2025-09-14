import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl ?? 'https://api.recantomontanhaverde.com.br';

  private seg(id: string) { return encodeURIComponent(id); }

  private auth() {
    const apiKey = (typeof localStorage !== 'undefined') ? localStorage.getItem('apiKey') : null;
    const headers: any = apiKey ? { 'apiKey': apiKey } : {};
    return { headers: new HttpHeaders(headers) };
  }

  // PUBLIC ENDPOINTS
  getBalance(cardId: string) {
    return this.http.get<{ balance: number }>(`${this.base}/cards/${this.seg(cardId)}/balance`);
  }

  getTransactions(cardId: string) {
    return this.http.get<Array<{id:string;date:string;amount:number;type:'add'|'subtract';description:string}>>(
      `${this.base}/cards/${this.seg(cardId)}/transactions`
    );
  }

  // Simple assignment check heuristic: if transactions returns 200, consider assigned; if 404, not assigned.
  isAssigned(cardId: string) {
    return this.http.get(`${this.base}/cards/${this.seg(cardId)}/transactions`, { observe: 'response' });
  }

  // PRIVATE ENDPOINTS (require apiKey)
  addBalance(cardId: string, amount: number) {
    return this.http.post<{ newBalance: number }>(
      `${this.base}/cards/${this.seg(cardId)}/balance/add`,
      { amount },
      this.auth()
    );
  }

  subtractBalance(cardId: string, amount: number) {
    return this.http.post<{ newBalance: number }>(
      `${this.base}/cards/${this.seg(cardId)}/balance/subtract`,
      { amount },
      this.auth()
    );
  }

  checkoutPreview(cardId: string, products: { productName: string; unitPrice: number; quantity: number }[]) {
    return this.http.post<{ totalAmount:number; balance:number; sufficientBalance:boolean }>(
      `${this.base}/cards/${this.seg(cardId)}/checkout-preview`,
      { products },
      this.auth()
    );
  }

  checkout(cardId: string, products: { productName: string; unitPrice: number; quantity: number }[]) {
    return this.http.post<{ newBalance:number; transaction:any }>(
      `${this.base}/cards/${this.seg(cardId)}/checkout`,
      { products },
      this.auth()
    );
  }

  assign(cardId: string, data: { name: string; cpf: string }) {
    return this.http.post<{ signedCardId: string }>(
      `${this.base}/cards/${this.seg(cardId)}/assign`,
      data,
      this.auth()
    );
  }
}
