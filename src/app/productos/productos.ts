import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-productos',
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
  standalone: true,
  imports: [CommonModule]
})
export class Productos implements OnInit {

  constructor(private dataService: ApiService) {}
  productos$!: Observable<any[]>;

  ngOnInit() {
  this.productos$ = this.dataService.getProductos();
  }
  
}
