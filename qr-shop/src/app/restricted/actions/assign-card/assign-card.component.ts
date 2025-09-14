import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { CardApiService } from '../../../core/services/card-api.service';

@Component({
  standalone: true,
  selector: 'app-assign-card',
  imports: [FormsModule, NgIf],
  template: `
  <div class="card">
    <h2>Vincular cartão</h2>
    <p class="muted">Card: {{ cardId }}</p>

    <label>Nome completo</label>
    <input placeholder="Ex: Maria Silva" [(ngModel)]="name" />

    <label>CPF (apenas números)</label>
    <input placeholder="Ex: 12345678901" [(ngModel)]="cpf" />

    <button class="btn primary" (click)="submit()" [disabled]="loading">Assinar e vincular</button>

    <div *ngIf="error" class="bad">{{ error }}</div>
    <div *ngIf="signed" class="ok">Assinado: <code>{{ signed }}</code></div>
  </div>
  `,
  styles: [`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05);display:grid;gap:12px}
    input{padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px}
  `]
})
export class AssignCardComponent {
  private route = inject(ActivatedRoute);
  private api = inject(CardApiService);

  cardId = decodeURIComponent(this.route.snapshot.paramMap.get('cardId') || '');
  name = '';
  cpf = '';
  loading = false;
  error = '';
  signed = '';

  submit(){
    this.error = ''; this.signed = ''; this.loading = true;
    const name = (this.name || '').trim();
    const cpf = (this.cpf || '').trim();
    if(!name || !cpf){
      this.error = 'Preencha nome e CPF.'; this.loading = false; return;
    }
    this.api.assign(this.cardId, { name, cpf }).subscribe({
      next: r => { this.signed = r?.signedCardId || ''; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Falha ao vincular. Verifique a API key.'; this.loading = false; }
    });
  }
}
