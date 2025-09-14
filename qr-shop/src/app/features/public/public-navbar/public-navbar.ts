import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu'; // <-- IMPORTANTE

@Component({
  standalone: true,
  selector: 'app-public-navbar',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule, // <-- IMPORTANTE
  ],
  templateUrl: './public-navbar.html', // <-- use o nome correto do arquivo
  styleUrls: ['./public-navbar.scss'],
})
export class PublicNavbarComponent {}
