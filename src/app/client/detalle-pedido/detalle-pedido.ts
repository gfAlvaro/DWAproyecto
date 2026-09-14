import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClienteService, DetallePedido } from '../../core/services/cliente.service';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.scss'
})

export class DetallePedidos implements OnInit {
  pedido: DetallePedido | null = null;
  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(id);
    } else {
      this.error = 'No se especificó un número de pedido válido.';
      this.cargando = false;
    }
  }

  cargarDetalle(id: string): void {
    this.cargando = true;
    this.clienteService.obtenerDetallePedido(id).subscribe({
      next: (data) => {
        this.pedido = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo recuperar la información de este pedido.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
