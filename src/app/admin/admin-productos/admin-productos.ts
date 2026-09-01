
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminProductosService } from '../../core/services/admin-productos.service';
import { Producto } from '../../producto/producto';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.scss'
})
export class AdminProductos implements OnInit {

  productos: Producto[] = [];
  cargando = false;
  error = '';

 constructor(
  private adminProductosService: AdminProductosService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {

    this.cargando = true;
    this.error = '';

    this.adminProductosService.obtenerProductos()
      .subscribe({

    next: (productos) => {
  this.productos = productos;
  this.cargando = false;

  this.cdr.detectChanges();
},
        error: (error) => {
          this.cargando = false;
          this.error =
            'No se pudieron cargar los productos';
        }

      });
  }
}