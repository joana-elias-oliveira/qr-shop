import {Component, ElementRef, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {BrowserMultiFormatReader} from '@zxing/browser';
import {Router} from '@angular/router';
import {Result} from '@zxing/library';

function isEmbeddedBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return /whatsapp|instagram|fbav|fban|fb_iab/.test(ua);
}

@Component({
  standalone: true,
  selector: 'app-scanner',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './scanner.html',
  styleUrls: ['./scanner.scss']
})
export class ScannerComponent implements OnInit, OnDestroy {
  @ViewChild('preview', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
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

  // Inicia automaticamente ao primeiro toque em qualquer lugar da tela
  autoStartOnTap() {
    if (!this.started()) this.start();
  }

  async start() {
    try {
      console.log('[scanner] requesting getUserMedia...');
      // 1) Pede permissão via gesto do usuário
      const tmp = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // tenta traseira
          width: { ideal: 1280 }, height: { ideal: 720 }
        },
        audio: false
      });
      // fecha o stream temporário (ZXing abrirá o seu)
      tmp.getTracks().forEach(t => t.stop());

      // 2) Lista câmeras (agora com labels)
      this.devices = await this.reader.listVideoInputDevices();
      console.log('[scanner] devices:', this.devices);
      const back = this.devices.find(d => /back|environment|traseira/i.test(d.label));
      this.currentDeviceId = back?.deviceId ?? this.devices[0]?.deviceId ?? null;

      if (!this.currentDeviceId) {
        alert('Nenhuma câmera foi encontrada neste dispositivo.');
        return;
      }

      // 3) Inicia decodificação contínua
      this.started.set(true);
      console.log('[scanner] starting decodeFromVideoDevice on', this.currentDeviceId);
      this.reader.decodeFromVideoDevice(
        this.currentDeviceId,
        this.videoRef.nativeElement,
        (result?: Result) => {
          if (result) {
            console.log('[scanner] QR result:', result.getText());
            this.stop();
            this.router.navigateByUrl('/products');
          }
        }
      );
    } catch (err: any) {
      console.error('[scanner] getUserMedia error:', err);
      const name = err?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        alert('Permissão da câmera negada. Ative a câmera nas configurações do site (cadeado da barra de endereço).');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        alert('Nenhuma câmera disponível/compatível foi encontrada.');
      } else {
        alert('Falha ao acessar a câmera: ' + (name || err));
      }
    }
  }

  switchCam() {
    if (!this.devices.length) return;
    const idx = this.devices.findIndex(d => d.deviceId === this.currentDeviceId);
    const next = (idx + 1) % this.devices.length;
    this.currentDeviceId = this.devices[next].deviceId;
    this.stop();
    this.start();
  }

  stop() {
    try { this.reader.reset(); } catch {}
    this.started.set(false);
  }

  ngOnDestroy() { this.stop(); }
}
