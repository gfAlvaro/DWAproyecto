import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  perfilForm!: FormGroup;
  cargando = true;
  enviando = false;
  mensajeExito = '';
  error = '';
  fechaRegistro = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarDatosPerfil();
  }

  inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]]
    });
  }

  cargarDatosPerfil(): void {
    this.cargando = true;
    this.clienteService.obtenerPerfil().subscribe({
      next: (cliente) => {
        this.fechaRegistro = cliente.fechaRegistro;
        this.perfilForm.patchValue(cliente);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar tus datos de perfil.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) return;

    this.enviando = true;
    this.mensajeExito = '';
    this.error = '';

    this.clienteService.actualizarPerfil(this.perfilForm.value).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje;
        this.enviando = false;

        const datosNuevos = this.perfilForm.value;
        const clienteActual = localStorage.getItem('cliente');
        
        if (clienteActual) {
          const clienteObjeto = JSON.parse(clienteActual);
          const clienteActualizado = { ...clienteObjeto, ...datosNuevos };
          
          localStorage.setItem('cliente', JSON.stringify(clienteActualizado));
          
          this.authService.perfilActualizado$.next(); 
        }

        this.cdr.detectChanges();
      },
      error: (err) => { /* ... */ }
    });
  }

}