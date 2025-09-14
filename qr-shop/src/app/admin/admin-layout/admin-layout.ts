import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AdminNavbarComponent} from '../admin-navbar/admin-navbar';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminNavbarComponent],
  template: `
    <app-admin-navbar></app-admin-navbar>
    <router-outlet></router-outlet>
  `
})
export class AdminLayoutComponent {}
