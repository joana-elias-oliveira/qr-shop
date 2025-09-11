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

      // 1) Tente com facingMode "environment" (traseira)
      const ok = await this.tryStartWith({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      if (ok) return;

      // 2) Fallback: qualquer câmera disponível
      const ok2 = await this.tryStartWith({ video: true, audio: false });
      if (ok2) return;

      // 3) Último recurso: tente listar devices e escolher a primeira por deviceId
      this.devices = await navigator.mediaDevices.enumerateDevices()
        .then(d => d.filter(x => x.kind === 'videoinput'));
      console.log('[scanner] enumerateDevices:', this.devices);

      const first = this.devices[0]?.deviceId;
      if (first) {
        const ok3 = await this.tryStartWith({ video: { deviceId: { exact: first } }, audio: false });
        if (ok3) return;
      }

      alert('Não foi possível iniciar a câmera (nenhuma combinação funcionou).');
    } catch (err: any) {
      this.handleMediaError(err);
    }
  }

  private async tryStartWith(constraints: MediaStreamConstraints): Promise<boolean> {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia(constraints);
      // Dica iOS: garantir inline/mudo
      this.videoRef.nativeElement.setAttribute('playsinline', '');
      this.videoRef.nativeElement.muted = true;

      // fecha stream temporário; ZXing abrirá o dele
      tmp.getTracks().forEach(t => t.stop());

      // listar devices após permissão (labels vêm preenchidos)
      this.devices = await this.reader.listVideoInputDevices();
      const back = this.devices.find(d => /back|environment|traseira/i.test(d.label));
      this.currentDeviceId = back?.deviceId ?? this.devices[0]?.deviceId ?? null;

      if (!this.currentDeviceId) return false;

      this.started.set(true);
      console.log('[scanner] starting decodeFromVideoDevice with', this.currentDeviceId, constraints);

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
      return true;
    } catch (e: any) {
      console.warn('[scanner] tryStartWith failed:', constraints, e?.name || e);
      if (e?.name === 'NotReadableError') {
        // geralmente: câmera em uso / driver travado / permissão do sistema
        // não derruba ainda — deixa próxima estratégia tentar
      }
      return false;
    }
  }

  private handleMediaError(err: any) {
    console.error('[scanner] getUserMedia error:', err);
    const name = err?.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      alert('Permissão negada. Libere a câmera no cadeado da URL / ajustes do navegador.');
    } else if (name === 'NotReadableError') {
      alert('A câmera parece estar em uso por outro app/aba ou bloqueada pelo sistema. Feche apps que usam câmera e verifique as permissões do sistema.');
    } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      alert('Nenhuma câmera disponível/compatível foi encontrada.');
    } else {
      alert('Falha ao acessar a câmera: ' + (name || err));
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
