import { Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { CardIdInputComponent } from '../../shared/components/cardid-input/cardid-input.component';
import { CardApiService } from '../../core/services/card-api.service';

@Component({
  standalone: true,
  selector: 'app-restricted-scan',
  imports: [NgIf, CardIdInputComponent],
  template: `
  <div class="card" *ngIf="promptActions">
    <h2>Escolha a ação</h2>
    <p class="muted">Cartão: {{ cardId }}</p>
    <div class="row" style="display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn primary" (click)="go('add')">Adicionar saldo</button>
      <button class="btn ghost" (click)="go('tx')">Ver transações</button>
      <button class="btn" style="background:#111827;color:#fff" (click)="go('checkout')">Fazer compra</button>
      <button class="btn" (click)="scanAnother()">Ler outro cartão</button>
    </div>
  </div>

  <div class="card">
    <h2>Escanear (Administrativo)</h2>
    <p class="muted">Leia o QR Code ou informe o Card ID para continuar com as ações.</p>

    <div class="video-wrap" *ngIf="showCamera">
      <video #video autoplay playsinline style="width:100%;max-height:260px;border-radius:12px;background:#000"></video>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn ghost" (click)="stopCamera()">Parar câmera</button>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px" *ngIf="!showCamera">
      <button class="btn ghost" (click)="startCamera()">Ativar câmera</button>
    </div>

    <app-cardid-input (choose)="onChoose($event)"></app-cardid-input>

    <div *ngIf="error" class="bad">{{ error }}</div>
  </div>
  `,
  styles: [`
    .card{background:#fff;padding:16px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.05);display:grid;gap:12px}
  `]
})
export class RestrictedScanComponent implements OnDestroy {
  private router = inject(Router);
  private api = inject(CardApiService);

  cardId = '';
  promptActions = false;
  error = '';

  showCamera = false;
  private stream?: MediaStream;

  onChoose(id: string){
    this.error = '';
    this.cardId = id;
    localStorage.setItem('lastCardId', id);

    // Heurística: se transactions 404 => sem vínculo, vai para assign. Senão mostra ações.
    this.api.isAssigned(id).subscribe({
      next: resp => { this.promptActions = !!resp && resp.status === 200; },
      error: e => {
        if(e?.status === 404){ this.router.navigate(['/restricted/assign', encodeURIComponent(id)]); return; }
        this.promptActions = true;
      }
    });
  }

  go(target: 'add'|'tx'|'checkout'){
    if(!this.cardId) return;
    if(target==='add') this.router.navigate(['/restricted/add-balance', encodeURIComponent(this.cardId)]);
    if(target==='tx') this.router.navigate(['/transactions', encodeURIComponent(this.cardId)]);
    if(target==='checkout') this.router.navigate(['/restricted/checkout', encodeURIComponent(this.cardId)]);
  }

  scanAnother(){
    this.promptActions = false;
    this.cardId = '';
    this.startCamera();
  }

  startCamera(){
    this.error='';
    if(this.showCamera) return;
    const anyNav = navigator as any;
    const gUM = anyNav?.mediaDevices?.getUserMedia?.bind(anyNav.mediaDevices);
    if(!gUM){ this.error = 'Câmera não disponível neste dispositivo/navegador.'; return; }
    gUM({ video: { facingMode: 'environment' } })
      .then((s: MediaStream) => {
        this.stream = s;
        const videoEl = document.querySelector('video') as HTMLVideoElement | null;
        if(videoEl){ videoEl.srcObject = s; }
        this.showCamera = true;
      })
      .catch(() => { this.error = 'Não foi possível acessar a câmera.'; });
  }

  stopCamera(){
    try { this.stream?.getTracks().forEach(t => t.stop()); } catch {}
    this.stream = undefined;
    this.showCamera = false;
  }

  ngOnDestroy(){ this.stopCamera(); }
}
