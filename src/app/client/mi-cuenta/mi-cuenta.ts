import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../../core/services/auth.service';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.scss'
})
export class MiCuenta implements OnInit {

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  cliente: Cliente | null = null;
  cargando = true;
  error = '';

  ngOnInit(): void {

    console.log('🔥 MiCuenta se ha iniciado');

    this.http.get<Cliente>('/api/cliente/me').subscribe({

      next: (cliente) => {

        console.log('✅ CLIENTE RECIBIDO:', cliente);

        this.cliente = cliente;

        console.log(
          '🔥 this.cliente DESPUÉS DE ASIGNAR:',
          this.cliente
        );

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('❌ Error obteniendo cliente:', error);

        this.error = 'No se han podido cargar tus datos.';
        this.cargando = false;

        this.cdr.detectChanges();
      }

    });

  }

}