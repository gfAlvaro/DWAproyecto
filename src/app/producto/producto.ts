import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto.html',
  styleUrl: './producto.scss'
})
export class Producto implements OnInit {
[x: string]: any;

  producto: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const slug = params.get('slug');

      if (!slug) {
        return;
      }

      this.api.getProducto(slug).subscribe({

        next: producto => {

          this.producto = producto;

          // Forzar actualización de la vista
          this.cdr.detectChanges();
        },

        error: error => {
          console.error('Error al obtener producto:', error);
        }

      });

    });
  }
}
