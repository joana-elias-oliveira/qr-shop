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
  styleUrl: './scanner.scss'
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

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false
      });
      stream.getTracks().forEach(t => t.stop());

      this.devices = await this.reader.listVideoInputDevices();
      const back = this.devices.find(d => /back|environment|traseira/i.test(d.label));
      this.currentDeviceId = back?.deviceId ?? this.devices[0]?.deviceId ?? null;

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
    } catch (err: any) {
      const msg = (err && err.name) ? err.name : String(err);
      if (err?.name === 'NotAllowedError') {
        alert('Permissão da câmera negada. Ative a câmera nas configurações do navegador.');
      } else if (err?.name === 'NotFoundError') {
        alert('Nenhuma câmera foi encontrada neste dispositivo.');
      } else {
        alert('Falha ao acessar a câmera: ' + msg);
      }
    }
  }

  switchCam() {
    if (!this.devices.length) return;
    const idx = this.devices.findIndex(d => d.deviceId === this.currentDeviceId);
    const next = (idx + 1) % this.devices.length;
    this.currentDeviceId = this.devices[next].deviceId;
    this.stop(); this.start();
  }

  stop() {
    try { this.reader.reset(); } catch {}
    this.started.set(false);
  }

  ngOnDestroy() { this.stop(); }
}
