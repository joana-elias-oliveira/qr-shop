import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment} from '../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private base = environment.apiBase;  // ex: 'https://api.example.com/v1'
  private key  = environment.apiKey || ''; // defina no build para rotas privadas

  private authHeaders() {
    return new HttpHeaders({ 'x-api-key': this.key }).set('Content-Type', 'application/json');
  }

  // --- Públicos ---
  getBalance(cardId: string) {
    return firstValueFrom(
      this.http.get<{balance:number}>(`${this.base}/cards/${encodeURIComponent(cardId)}/balance`)
    );
  }

  getTransactions(cardId: string, params?: {limit?:number; cursor?:string; from?:string; to?:string}) {
    return firstValueFrom(
      this.http.get<{items:any[]; nextCursor?:string}>(
        `${this.base}/cards/${encodeURIComponent(cardId)}/transactions`,
        { params: params as any }
      )
    );
  }

  // --- Privados (header x-api-key) ---
  addBalance(cardId: string, amount: number) {
    return firstValueFrom(
      this.http.post<{newBalance:number}>(
        `${this.base}/cards/${encodeURIComponent(cardId)}/balance/add`,
        { amount },
        { headers: this.authHeaders() }
      )
    );
  }

  subtractBalance(cardId: string, amount: number) {
    return firstValueFrom(
      this.http.post<{newBalance:number}>(
        `${this.base}/cards/${encodeURIComponent(cardId)}/balance/subtract`,
        { amount },
        { headers: this.authHeaders() }
      )
    );
  }

  // Se você criar no backend:
  // purchase(cardId: string, items: Array<{sku:string; qty:number; price:number}>) {
  //   return firstValueFrom(
  //     this.http.post<{newBalance:number; transactionId:string}>(
  //       `${this.base}/cards/${encodeURIComponent(cardId)}/purchase`,
  //       { items }, { headers: this.authHeaders() }
  //     )
  //   );
  // }
}
