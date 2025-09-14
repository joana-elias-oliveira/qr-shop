import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cardid-input',
  standalone: true,
  imports: [FormsModule],
  template: `
  <div class="cardid">
    <label for="cardId">Card ID</label>
    <div class="row">
      <input id="cardId" [(ngModel)]="value" placeholder="Ex: RMV-123-ABC" (keyup.enter)="submit()"/>
      <button class="btn primary" (click)="submit()">OK</button>
    </div>
  </div>
  `,
  styles:[`
    .cardid{display:grid;gap:6px}
    label{font-size:12px;color:#64748b}
    .row{display:flex;gap:8px}
    input{flex:1;padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px}
  `]
})
export class CardIdInputComponent {
  value = localStorage.getItem('lastCardId') ?? '';
  @Output() choose = new EventEmitter<string>();
  submit(){
    const id = (this.value || '').trim();
    if(!id) return;
    localStorage.setItem('lastCardId', id);
    this.choose.emit(id);
  }
}
