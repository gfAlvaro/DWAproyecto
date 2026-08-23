import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/admin/login']);

  }
}
