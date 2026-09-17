import { Component, OnInit } from '@angular/core';
import { AdminPedidosService } from '../../core/services/admin-pedidos.service';

@Component({
  selector: 'app-detalles-pedido',
  imports: [],
  templateUrl: './detalles-pedido.html',
  styleUrl: './detalles-pedido.scss',
})

export class DetallesPedido implements OnInit {

  pedidos: any[] = [];
  estadosDisponibles: string[] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
  
  // Guarda el ID del pedido que está abierto actualmente
  pedidoExpandidoID: number | null = null; 
  detallesCargados: any[] = [];

  constructor(private pedidosService: AdminPedidosService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidosService.obtenerPedidos().subscribe({
      next: (data) => this.pedidos = data,
      error: (err) => console.error(err)
    });
  }

  toggleDetalles(pedidoID: number): void {
    // Si se hace clic en el que ya está abierto, se cierra
    if (this.pedidoExpandidoID === pedidoID) {
      this.pedidoExpandidoID = null;
      this.detallesCargados = [];
      return;
    }

    // Si es uno nuevo, se consultan sus detalles a la API
    this.pedidosService.getDetallesPedido(pedidoID).subscribe({
      next: (detalles) => {
        this.pedidoExpandidoID = pedidoID;
        this.detallesCargados = detalles;
      },
      error: (err) => console.error('Error al cargar detalles', err)
    });
  }

  onEstadoChange(pedidoID: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstado = selectElement.value;

    this.pedidosService.cambiarEstado(pedidoID, nuevoEstado).subscribe({
      next: () => {
        alert('Estado actualizado');
        this.cargarPedidos();
      },
      error: (err) => console.error(err)
    });
  }
}
