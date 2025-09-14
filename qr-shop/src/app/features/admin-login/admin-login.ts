import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';            // <-- ngIf
import { FormsModule } from '@angular/forms';              // <-- ngModel
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {AuthService} from '../../core/auth';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss']
})
export class AdminLoginComponent {
  pin = ''; error = false;
  constructor(private auth: AuthService, private router: Router) {}
  go(){
    this.error = !this.auth.login(this.pin);
    if (!this.error) this.router.navigateByUrl('/admin');
  }
}
