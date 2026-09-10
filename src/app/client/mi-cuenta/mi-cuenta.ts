import { Component, OnInit, inject } from '@angular/core';
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

  cliente: Cliente | null = null;
  cargando = true;
  error = '';

  ngOnInit(): void {

    this.http.get<Cliente>('/api/cliente/me').subscribe({

      next: (cliente) => {

        this.cliente = cliente;
        this.cargando = false;

      },

      error: (error) => {

        console.error('Error obteniendo cliente:', error);

        this.error = 'No se han podido cargar tus datos.';
        this.cargando = false;

      }

    });

  }

}
