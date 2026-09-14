import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {

  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private meta: Meta
  ) {}

  // dexindexar el acceso a la página de login para que no aparezca en los motores de búsqueda
  ngOnInit(): void {
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  login(): void {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Email y contraseña son obligatorios';
      return;
    }

    this.cargando = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        this.cargando = false;
        this.error = error.error?.mensaje || 'Error al iniciar sesión';
      }
    });
  }
}
