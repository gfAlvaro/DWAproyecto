import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.scss'
})

export class MiCuenta implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
     window.addEventListener('storage', () => {
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.authService.perfilActualizado$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  get cliente() {
    return this.authService.getCliente();
  }

  logout(): void {
    this.authService.logoutCliente();
    window.location.href = '/login';
  }
}