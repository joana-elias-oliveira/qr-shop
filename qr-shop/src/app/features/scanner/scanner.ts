import { Component, AfterViewInit, signal, ViewChild } from '@angular/core';
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
export class ScannerComponent implements AfterViewInit {
  @ViewChild('scannerEl') scannerEl?: ZXingScannerComponent;

  devices: MediaDeviceInfo[] = [];
  currentDevice?: MediaDeviceInfo;

  formats = [BarcodeFormat.QR_CODE];

  hasPermission = signal(false);
  showScanner   = signal(true);   // mantém true p/ tentar ligar direto
  scanning      = signal(false);

  constructor(private session: SessionService, private router: Router) {}

  ngAfterViewInit() {
    // garante que o ViewChild exista antes de pedir permissão
    setTimeout(() => this.ensurePermissionAndStart(), 0);
  }

  onPermission(ok: boolean) {
    this.hasPermission.set(ok);
  }

  onCamerasFound(devs: MediaDeviceInfo[]) {
    this.devices = devs || [];
    this.currentDevice =
      this.devices.find(d => /back|environment|traseira/i.test(d.label)) ?? this.devices[0];
  }

  async ensurePermissionAndStart() {
    if (!this.scannerEl) return;
    try {
      const ok = await this.scannerEl.askForPermission();
      this.hasPermission.set(!!ok);
      if (ok) {
        this.showScanner.set(true);
        this.scanning.set(true);
      }
    } catch {
      // silencioso; o template já mostra controles se precisar
    }
  }

  switchCam() {
    if (!this.devices.length || !this.currentDevice) return;
    const i = this.devices.findIndex(d => d.deviceId === this.currentDevice!.deviceId);
    this.currentDevice = this.devices[(i + 1) % this.devices.length];
  }

  stop() {
    this.showScanner.set(false);
    this.scanning.set(false);
  }

  onScanSuccess(value: string) {
    const key = (value || '').trim();
    if (key) {
      this.session.setKey(key);
      this.stop();
      this.router.navigateByUrl('/products');
    }
  }
}
