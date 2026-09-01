import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';
import { AdminClientesService } from '../../core/services/admin-clientes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss'
})
export class AdminClientes implements OnInit {

  constructor(private dataService: AdminClientesService) {}
  clientes$!: Observable<any[]>;

  ngOnInit() {
  this.clientes$! = this.dataService.obtenerClientes();
  }
}