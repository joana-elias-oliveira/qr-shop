import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PublicNavbarComponent} from './features/public/public-navbar/public-navbar';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, PublicNavbarComponent],
  template: `
    <app-public-navbar></app-public-navbar>
    <router-outlet></router-outlet>
  `,
})
export class App {}
