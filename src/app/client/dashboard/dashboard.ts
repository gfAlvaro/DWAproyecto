import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService, Pedido } from '../../core/services/cliente.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard implements OnInit {

  pedidos: Pedido[] = [];
  pedidosRecientes: Pedido[] = [];
  totalPedidos = 0;
  totalGastado = 0;
  cargando = true;
  error = '';

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';

    this.clienteService.obtenerPedidos().subscribe({
      next: (pedidos) => {
        const listaPedidos = pedidos || []; 
        this.pedidos = listaPedidos;
        this.totalPedidos = listaPedidos.length;
        this.totalGastado = listaPedidos.reduce((total, pedido) => total + Number(pedido.total || 0), 0);
        this.pedidosRecientes = listaPedidos.slice(0, 3);
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.pedidos = [];
        this.pedidosRecientes = [];
        this.totalPedidos = 0;
        this.totalGastado = 0;
        this.error = 'No se pudieron cargar tus pedidos';
        this.cargando = false;
        this.cdr.detectChanges(); 
      }
    });
  }
}