import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../core/services/cliente.service';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './seguridad.html',
  styleUrl: './seguridad.scss'
})

export class Seguridad {
  passwordForm: FormGroup;
  enviando = false;
  mensajeExito = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {
    this.passwordForm = this.fb.group({
      passwordActual: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: this.validarContrasenasCoincidentes });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  validarContrasenasCoincidentes(group: FormGroup) {
    const nueva = group.get('nuevaPassword')?.value;
    const confirmar = group.get('confirmarPassword')?.value;
    return nueva === confirmar ? null : { noCoinciden: true };
  }

  guardarPassword(): void {
    if (this.passwordForm.invalid) return;

    this.enviando = true;
    this.mensajeExito = '';
    this.error = '';

    const datos = {
      passwordActual: this.passwordForm.get('passwordActual')?.value,
      nuevaPassword: this.passwordForm.get('nuevaPassword')?.value
    };

    this.clienteService.cambiarPassword(datos).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje;
        this.passwordForm.reset();
        this.enviando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.mensaje || 'Hubo un error al cambiar la contraseña.';
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
