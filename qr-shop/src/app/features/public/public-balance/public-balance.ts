import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';  // <-- *ngIf + number
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {SessionService} from '../../../core/session';
import {WalletService} from '../../../core/wallet';


@Component({
  standalone: true,
  selector: 'app-public-balance',
  imports: [CommonModule, MatButtonModule, DecimalPipe],
  templateUrl: './public-balance.html',
  styleUrls: ['./public-balance.scss']
})
export class PublicBalanceComponent implements OnInit {
  key: string | null = null;
  balance = 0;

  constructor(
    private session: SessionService,
    private wallet: WalletService,
    private router: Router
  ) {}

  ngOnInit() {
    this.session.restore();
    this.key = this.session.shopKey();
    if (this.key) this.balance = this.wallet.getBalance(this.key);
  }

  goScan(){ this.router.navigateByUrl('/scan'); }
}
