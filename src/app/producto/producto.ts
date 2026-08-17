import { Component } from '@angular/core';

@Component({
  selector: 'app-producto',
  imports: [],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
})
export class Producto {
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');

      if (slug) {
        this.productoService.getProducto(slug).subscribe({
          next: producto => {
            this.producto = producto;
          },
          error: () => {
            // Mostrar página 404
          }
        });
      }
    });
  }

}
