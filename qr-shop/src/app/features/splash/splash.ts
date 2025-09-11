import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrl: './splash.scss'
})
export class SplashComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {
    setTimeout(() => this.router.navigateByUrl('/scan'), 1200);
  }
}
