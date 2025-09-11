import {Component, ElementRef, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {BrowserMultiFormatReader} from '@zxing/browser';
import {Router} from '@angular/router';
import {Result} from '@zxing/library';

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
  reading = signal<boolean>(false);

  constructor(private router: Router) {}

  async ngOnInit() {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tmp.getTracks().forEach(t => t.stop());

      this.devices = await this.reader.listVideoInputDevices();
      const back = this.devices.find(d => /back|environment|traseira/i.test(d.label));
      this.currentDeviceId = back?.deviceId ?? this.devices[0]?.deviceId ?? null;

      await this.start();
    } catch {
      alert('Não foi possível acessar a câmera. Verifique permissões e HTTPS.');
    }
  }

  async start() {
    if (!this.currentDeviceId) return;
    this.reading.set(true);
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
  }

  stop() {
    this.reading.set(false);
    try { this.reader.reset(); } catch {}
  }

  switchCam() {
    if (!this.devices.length) return;
    const idx = this.devices.findIndex(d => d.deviceId === this.currentDeviceId);
    const next = (idx + 1) % this.devices.length;
    this.currentDeviceId = this.devices[next].deviceId;
    this.stop(); this.start();
  }

  ngOnDestroy() { this.stop(); }
}
