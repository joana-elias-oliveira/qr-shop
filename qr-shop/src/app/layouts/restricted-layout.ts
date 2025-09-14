import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-restricted-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './restricted-layout.html',
  styleUrls: ['./restricted-layout.scss'],
})
export class RestrictedLayoutComponent {
  lastCardId = localStorage.getItem('lastCardId') ?? '';
}
