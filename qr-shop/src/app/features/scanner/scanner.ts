import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
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
  styleUrls: ['./scanner.scss']
})
export class ScannerComponent implements OnInit, OnDestroy {
  @ViewChild('preview', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  private reader = new (BrowserMultiFormatReader as any)();
  private devices: MediaDeviceInfo[] = [];
  private currentDeviceId: string | null = null;

  started = signal(false);
  insecure = signal(false);
  inApp = signal(false);

  // expõe window.location para o template
  public readonly loc = window.location;

  constructor(private router: Router) {}

  ngOnInit() {
    // HTTPS (ou localhost) é obrigatório pro getUserMedia.
    this.insecure.set(!(window as any).isSecureContext);
    this.inApp.set(isEmbeddedBrowser());
  }

  /** Botão principal */
  async start() {
    if (this.insecure()) {
      alert('Precisa abrir em HTTPS (ou localhost).');
      return;
    }
    // Em app embutido: apenas mostra aviso, mas deixa o usuário apertar "Tentar mesmo assim"
    if (this.inApp()) return;
    await this.openCameraWithFallbacks();
  }

  /** Botão "Tentar mesmo assim" quando está em app embutido */
  async forceStart() {
    if (this.insecure()) {
      alert('Precisa abrir em HTTPS (ou localhost).');
      return;
    }
    await this.openCameraWithFallbacks();
  }

  private async openCameraWithFallbacks() {
    // atributos exigidos no iOS
    const v = this.videoRef.nativeElement;
    v.setAttribute('playsinline', '');
    v.muted = true;

    // 1) tenta traseira
    if (await this.tryStartWith({ video: { facingMode: { ideal: 'environment' } }, audio: false })) return;

    // 2) qualquer câmera
    if (await this.tryStartWith({ video: true, audio: false })) return;

    // 3) lista devices e tenta por deviceId
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      this.devices = all.filter((d: MediaDeviceInfo) => d.kind === 'videoinput');
      const first = this.devices[0]?.deviceId;
      if (first) {
        if (await this.tryStartWith({ video: { deviceId: { exact: first } }, audio: false })) return;
      }
    } catch {
      // ignore
    }

    alert('Não consegui iniciar a câmera (feche apps que usam câmera e revise permissões do navegador/sistema).');
  }

  private async tryStartWith(constraints: MediaStreamConstraints): Promise<boolean> {
    try {
      // gesto do usuário já ocorreu (click), então a permissão deve abrir
      const tmp = await navigator.mediaDevices.getUserMedia(constraints);
      tmp.getTracks().forEach(t => t.stop());

      // depois da permissão, labels ficam visíveis — escolha a traseira
      this.devices = await this.reader.listVideoInputDevices();
      const back = this.devices.find((d: MediaDeviceInfo) => /back|environment|traseira/i.test(d.label));
      this.currentDeviceId = back?.deviceId ?? this.devices[0]?.deviceId ?? null;
      if (!this.currentDeviceId) return false;

      const v = this.videoRef.nativeElement;
      this.started.set(true);

      this.reader.decodeFromVideoDevice(this.currentDeviceId, v, (result?: Result) => {
        if (!result) return;
        const key = result.getText().trim();
        // TODO: salvar a chave no seu SessionService se quiser
        this.stop();
        this.router.navigateByUrl('/saldo');
      });
      return true;
    } catch (e: any) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        alert('Permissão negada. Clique no cadeado da URL e ative a câmera.');
      } else if (name === 'NotReadableError') {
        // câmera em uso por outro app; não alerta aqui para deixar o próximo fallback tentar
        console.warn('[scanner] NotReadableError com', constraints);
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        console.warn('[scanner] Nenhuma câmera compatível para', constraints);
      } else {
        console.warn('[scanner] Falha com', constraints, e);
      }
      return false;
    }
  }

  stop() {
    try { this.reader.reset(); } catch {}
    this.started.set(false);
    const v = this.videoRef?.nativeElement;
    const s = (v?.srcObject as MediaStream | null);
    s?.getTracks().forEach(t => t.stop());
    if (v) v.srcObject = null;
  }

  ngOnDestroy() { this.stop(); }
}
