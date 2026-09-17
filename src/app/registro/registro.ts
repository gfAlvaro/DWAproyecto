import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true, // Si usas NgModules, remueve esta línea y el array de imports
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  mensajeError: string = '';
  mensajeExito: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  formRegistro: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: [''],
    direccion: ['']
  });

  enviar() {
    if (this.formRegistro.invalid) return;

    this.authService.registrar(this.formRegistro.value).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje;
        this.mensajeError = '';
        this.formRegistro.reset();
      },
      error: (err) => {
        this.mensajeError = err.error?.error || 'No se pudo completar el registro.';
        this.mensajeExito = '';
      }
    });
  }
}
