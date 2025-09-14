import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {WalletService} from '../../core/wallet';
import {SessionService} from '../../core/session';

@Component({
  standalone: true,
  selector: 'app-debit-balance',
  imports: [CommonModule, FormsModule, MatButtonModule, DecimalPipe],
  templateUrl: './debit-balance.html',
  styleUrls: ['./debit-balance.scss']
})
export class DebitBalanceComponent {
  key: string | null;
  amount = 0;
  error = false;

  constructor(public wallet: WalletService, private session: SessionService) { // <-- public
    this.session.restore();
    this.key = this.session.shopKey();
  }

  debit(){
    this.error = false;
    if(this.key && this.amount>0){
      const ok = this.wallet.debit(this.key, this.amount);
      if(!ok) this.error = true;
      else this.amount = 0;
    }
  }
}
