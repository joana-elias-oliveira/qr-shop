import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone:true, selector:'app-api-key-login', imports:[FormsModule],
  template:`
  <div class="card">
    <h2>Autenticar</h2>
    <p class="muted">Informe sua <b>API Key</b> para habilitar ações administrativas.</p>
    <input [(ngModel)]="apiKey" placeholder="api_************************" />
    <button class="btn primary" (click)="save()">Salvar</button>
  </div>
  `,
  styles:[`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05);display:grid;gap:12px}
    input{padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px}
  `]
})
export class ApiKeyLoginComponent {
  apiKey = localStorage.getItem('apiKey') ?? '';
  constructor(private router: Router) {}
  save(){
    if(!this.apiKey.trim()) return;
    localStorage.setItem('apiKey', this.apiKey.trim());
    this.router.navigate(['/restricted/scan']);
  }
}
