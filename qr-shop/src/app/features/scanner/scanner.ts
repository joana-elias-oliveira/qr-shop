import {
  Component, ElementRef, OnDestroy, OnInit, ViewChild, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Result } from '@zxing/library';

function isEmbeddedBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return /whatsapp|instagram|fbav|fban|fb_iab/.test(ua);
}

@Component({
  standalone: true,
  selector: 'app-scanner',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './scanner.html',
  styleUrls: ['./scanner.scss'],
})
export class ScannerComponent implements OnInit, OnDestroy {
  // ⚠️ Importante: static: false, porque o <video> está dentro de *ngIf/ng-template
  @ViewChild('preview', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;

  private reader = new (BrowserMultiFormatReader as any)();
  private devices: MediaDeviceInfo[] = [];
  private currentDeviceId: string | null = null;

  started = signal(false);
  embedded = signal(false);
  locationHref = location.href;

  constructor(private router: Router) {}

  ngOnInit() {
    this.embedded.set(isEmbeddedBrowser());
  }

  ngOnDestroy() { this.stop(); }

  private killAllVideoTracks() {
    try {
      const v = this.videoRef?.nativeElement;
      const stream = v?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (v) v.srcObject = null;
    } catch {}
    try { this.reader.reset(); } catch {}
  }

  // espera o Angular materializar o <video> do *ngIf antes de usar
  private async ensureVideoReady() {
    let tries = 0;
    while ((!this.videoRef || !this.videoRef.nativeElement) && tries < 5) {
      await new Promise(r => setTimeout(r, 0)); // próximo tick
      tries++;
    }
    if (!this.videoRef || !this.videoRef.nativeElement) {
      throw new Error('video element not ready');
    }
  }

  async start() {
    // Mostra o <video> (área do scanner) antes de buscar a ref
    // O seu template mostra o botão quando !started(); aqui ainda é false, ok.
    await this.ensureVideoReady();            // ✅ garante videoRef
    this.killAllVideoTracks();

    // iOS precisa desses atributos SEMPRE
    this.videoRef.nativeElement.setAttribute('playsinline', '');
    this.videoRef.nativeElement.muted = true;

    // 1) tenta traseira
    if (await this.tryStartWith({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    })) return;

    // 2) qualquer câmera
    if (await this.tryStartWith({ video: true, audio: false })) return;

    // 3) deviceId específico
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      this.devices = all.filter(d => d.kind === 'videoinput');
      const first = this.devices[0]?.deviceId;
      if (first) {
        if (await this.tryStartWith({ video: { deviceId: { exact: first } }, audio: false })) return;
      }
    } catch {}

    alert('Não consegui iniciar a câmera (feche apps que usam câmera e revise permissões do sistema).');
  }

  private async tryStartWith(constraints: MediaStreamConstraints): Promise<boolean> {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia(constraints);
      tmp.getTracks().forEach(t => t.stop());

      this.devices = await this.reader.listVideoInputDevices();
      const back = this.devices.find(d => /back|environment|traseira/i.test(d.label));
      this.currentDeviceId = back?.deviceId ?? this.devices[0]?.deviceId ?? null;
      if (!this.currentDeviceId) return false;

      this.started.set(true);
      this.reader.decodeFromVideoDevice(
        this.currentDeviceId,
        this.videoRef.nativeElement,
        (result?: Result) => {
          if (result) {
            this.stop();
            this.router.navigateByUrl('/products');
          }
        }
      );
      return true;
    } catch (e: any) {
      if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
        alert('Permissão negada. Libere a câmera no cadeado da URL / ajustes do navegador.');
      } else if (e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError') {
        alert('Nenhuma câmera disponível/compatível foi encontrada.');
      } else if (e?.name === 'NotReadableError') {
        console.warn('[scanner] NotReadableError com', constraints);
      } else {
        console.warn('[scanner] Falha com', constraints, e);
      }
      return false;
    }
  }

  switchCam() {
    if (!this.devices.length) return;
    const idx = this.devices.findIndex(d => d.deviceId === this.currentDeviceId);
    const next = (idx + 1) % this.devices.length;
    this.currentDeviceId = this.devices[next].deviceId;
    this.stop();
    // reabre direto na câmera escolhida
    this.reader.decodeFromVideoDevice(
      this.currentDeviceId!,
      this.videoRef.nativeElement,
      (result?: Result) => {
        if (result) {
          this.stop();
          this.router.navigateByUrl('/products');
        }
      }
    );
    this.started.set(true);
  }

  stop() {
    this.killAllVideoTracks();
    this.started.set(false);
  }
}
