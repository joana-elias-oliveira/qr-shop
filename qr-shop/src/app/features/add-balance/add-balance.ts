import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {WalletService} from '../../core/wallet';
import {SessionService} from '../../core/session';

@Component({
  standalone: true,
  selector: 'app-add-balance',
  imports: [
    CommonModule, DecimalPipe,
    FormsModule, ReactiveFormsModule,
    RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './add-balance.html',
  styleUrls: ['./add-balance.scss']
})
export class AddBalanceComponent implements OnInit {
  key: string | null = null;
  balance = computed(() => this.key ? this.wallet.getBalance(this.key) : 0);
  amount = new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] });
  busy = signal(false);

  constructor(
    private session: SessionService,
    private wallet: WalletService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.session.restore();
    this.key = this.session.shopKey();
  }

  add() {
    if (!this.key) { this.snack.open('Nenhuma chave ativa. Leia um QR.', 'OK', { duration: 2500 }); return; }
    if (this.amount.invalid || !this.amount.value) { this.amount.markAsTouched(); return; }
    this.busy.set(true);
    this.wallet.add(this.key, Number(this.amount.value));
    this.amount.reset(null);
    this.busy.set(false);
    this.snack.open('Saldo adicionado!', 'OK', { duration: 2000 });
  }

  goScan(){ this.router.navigateByUrl('/scan'); }
}
