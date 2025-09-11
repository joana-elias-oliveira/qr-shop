import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ZXingScannerModule, ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { SessionService } from '../../core/session';

@Component({
  standalone: true,
  selector: 'app-scanner',
  imports: [CommonModule, MatButtonModule, ZXingScannerModule],
  templateUrl: './scanner.html',
  styleUrls: ['./scanner.scss'],
})
export class ScannerComponent implements OnInit {
  @ViewChild('scannerEl') scannerEl?: ZXingScannerComponent;

  devices: MediaDeviceInfo[] = [];
  currentDevice?: MediaDeviceInfo;

  formats = [BarcodeFormat.QR_CODE];

  hasPermission = signal(false);
  showScanner   = signal(true);   // 👈 já começa montado pra tentar abrir direto
  scanning      = signal(false);

  constructor(private session: SessionService, private router: Router) {}

  ngOnInit() {
    // tenta pedir permissão assim que o componente carrega (alguns browsers permitem sem clique)
    queueMicrotask(async () => {
      try {
        if (!this.scannerEl) return;
        const ok = await this.scannerEl.askForPermission();
        this.hasPermission.set(!!ok);
        if (ok) {
          this.scanning.set(true);
        }
      } catch {
        // fica no fallback: botão "permitir/iniciar"
      }
    });
  }

  onPermission(ok: boolean) {
    this.hasPermission.set(ok);
  }

  onCamerasFound(devs: MediaDeviceInfo[]) {
    this.devices = devs;
    this.currentDevice =
      devs.find(d => /back|environment|traseira/i.test(d.label)) ?? devs[0];
  }

  async ensurePermissionAndStart() {
    if (!this.scannerEl) return;
    const ok = await this.scannerEl.askForPermission();
    this.hasPermission.set(!!ok);
    if (ok) {
      this.showScanner.set(true);
      this.scanning.set(true);
    }
  }

  switchCam() {
    if (!this.devices.length) return;
    const i = this.devices.findIndex(d => d.deviceId === this.currentDevice?.deviceId);
    this.currentDevice = this.devices[(i + 1) % this.devices.length];
  }

  stop() {
    this.showScanner.set(false);  // desmonta -> libera câmera
    this.scanning.set(false);
    // se quiser manter o preview visível, pode setar true de novo depois
  }

  onScanSuccess(value: string) {
    // salva a key e vai pra /products
    const key = value?.trim();
    if (key) {
      this.session.setKey(key);
      this.stop();
      this.router.navigateByUrl('/products');
    }
  }
}
