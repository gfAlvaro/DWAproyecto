import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';
import { AdminPedidosService } from '../../core/services/admin-pedidos.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class AdminPedidos implements OnInit {

  constructor(private dataService: AdminPedidosService) {}
  pedidos$!: Observable<any[]>;

  ngOnInit() {
  this.pedidos$! = this.dataService.obtenerPedidos();
  }
}
