import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService, Pedido } from '../../core/services/cliente.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [ DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos implements OnInit {
  pedidos: Pedido[] = [];
  cargando = true;
  error = '';

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerTodosLosPedidos();
  }

  obtenerTodosLosPedidos(): void {
    this.cargando = true;
    this.error = '';

    this.clienteService.obtenerPedidos().subscribe({
      next: (data) => {
        this.pedidos = data || [];
        this.cargando = false;
        this.cdr.detectChanges(); // Aseguramos el renderizado reactivo
      },
      error: (err) => {
        console.error('Error al recuperar el historial completo:', err);
        this.pedidos = [];
        this.error = 'No se pudo cargar tu historial de pedidos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
