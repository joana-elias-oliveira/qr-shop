import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { CardIdInputComponent } from '../../shared/components/cardid-input/cardid-input.component';

@Component({
  standalone: true,
  selector: 'app-public-scan',
  imports: [NgIf, CardIdInputComponent],
  template: `
  <div class="card scan">
    <h2>Escanear cartão</h2>
    <p class="muted">Aponte a câmera para o QR Code ou informe o Card ID.</p>

    <div class="video-wrap">
      <video #video autoplay playsinline></video>
      <div class="overlay"></div>
    </div>

    <div class="actions">
      <button class="btn primary" (click)="start()">Ligar câmera</button>
      <button class="btn ghost" (click)="stop()" *ngIf="running">Parar</button>
    </div>

    <app-cardid-input (choose)="go($event)"></app-cardid-input>

    <div class="hint">Após ler, você será levado(a) ao saldo e poderá abrir as transações.</div>
  </div>
  `,
  styles: [`
    .scan{display:grid;gap:12px}
    .video-wrap{position:relative;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;background:#000}
    video{width:100%;height:auto;display:block}
    .overlay{position:absolute;inset:0;box-shadow:inset 0 0 0 2px rgba(220,38,38,0.85), 0 0 0 9999px rgba(0,0,0,.25); pointer-events:none}
    .actions{display:flex;gap:8px;flex-wrap:wrap}
    .hint{font-size:12px;color:#64748b}
  `]
})
export class PublicScanComponent implements OnDestroy {
  private codeReader?: any;
  private stream?: MediaStream;
  running = false;

  constructor(private router: Router) {}

  async start(){
    try{
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      this.codeReader = new BrowserMultiFormatReader();
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.querySelector('video') as HTMLVideoElement;
      video.srcObject = this.stream;
      await video.play();
      this.running = true;

      await this.codeReader.decodeFromVideoDevice(undefined, video, (result:any) => {
        if (result) {
          const text = (result.getText?.() ?? result.text ?? '').trim();
          if (text) {
            this.stop();
            localStorage.setItem('lastCardId', text);
            this.go(text);
          }
        }
      });
    }catch(e){
      console.error(e);
      this.running = false;
    }
  }

  stop(){
    this.running = false;
    try{
      this.stream?.getTracks().forEach(t=>t.stop());
    }catch{}
  }

  go(cardId: string){
    this.router.navigate(['/balance', encodeURIComponent(cardId)]);
  }

  ngOnDestroy(){ this.stop(); }
}
