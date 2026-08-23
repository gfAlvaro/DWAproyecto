import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
    private router: Router
  ) {}

  login(): void {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Email y contraseña son obligatorios';
      return;
    }

    this.cargando = true;

    this.authService
      .login(this.email, this.password)
      .subscribe({

        next: () => {

          this.cargando = false;

          this.router.navigate(['/admin/dashboard']);

        },

        error: (error) => {

          this.cargando = false;

          this.error =
            error.error?.mensaje ||
            'Error al iniciar sesión';

        }

      });
  }
}
