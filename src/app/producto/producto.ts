import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api';
import { SeoService } from '../core/services/seo.service';

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
    private seoService: SeoService,
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
        next: (producto) => {
          this.producto = producto;
          
          if (producto) {
            console.log('API de producto respondió con éxito para SEO:', producto);
            this.seoService.updateData(
              `${producto.name || producto.nombreProducto || 'Producto'} | Fractals`,
              producto.shortDescription || 'Compra este producto al mejor precio.'
            );
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al obtener producto:', error);
        }
      });
    });
  }
}
