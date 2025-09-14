import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {SessionService} from '../../core/session';
import {ApiService} from '../../core/api-service';

@Component({
  standalone: true,
  selector: 'app-add-balance',
  imports: [
    CommonModule, DecimalPipe,
    FormsModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './add-balance.html',
  styleUrls: ['./add-balance.scss']
})
export class AddBalanceComponent implements OnInit {
  key: string | null = null;
  balance = signal(0);
  amount = new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] });
  busy = signal(false);

  constructor(
    private session: SessionService,
    private api: ApiService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  async ngOnInit() {
    this.session.restore();
    this.key = this.session.shopKey();
    if (this.key) {
      try { this.balance.set((await this.api.getBalance(this.key)).balance ?? 0); }
      catch { this.snack.open('Falha ao carregar saldo.', 'OK', { duration: 2000 }); }
    }
  }

  async add() {
    if (!this.key) { this.snack.open('Nenhuma chave ativa.', 'OK', { duration: 1500 }); return; }
    if (this.amount.invalid || !this.amount.value) { this.amount.markAsTouched(); return; }
    this.busy.set(true);
    try {
      const res = await this.api.addBalance(this.key, Number(this.amount.value));
      this.balance.set(res.newBalance ?? this.balance() + Number(this.amount.value));
      this.amount.reset(null);
      this.snack.open('Saldo adicionado!', 'OK', { duration: 1500 });
    } finally { this.busy.set(false); }
  }

  goScan(){ this.router.navigateByUrl('/scan'); }
}
