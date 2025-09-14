import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from './features/public/public-navbar/public-navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent],
  template: `
    <app-public-navbar></app-public-navbar>
    <main class="page">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`.page{max-width:1100px;margin:24px auto;padding:0 16px;}`]
})
export class App {}
