import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { AdminProductosService } from '../../core/services/admin-productos.service';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.scss'
})
export class EditarProducto implements OnInit {
  // Imagen seleccionada desde el ordenador
  imagenSeleccionada: File | null = null;

  // Vista previa de la imagen
  previewImagen: string | null = null;
  productoId!: number;

  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';

constructor(
  private fb: FormBuilder,
  private router: Router,
  private route: ActivatedRoute,
  private adminProductosService: AdminProductosService,
  private cdr: ChangeDetectorRef
) {

  this.formulario = this.fb.group({
    nombreProducto: ['', Validators.required],
    slug: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    pathImagen: ['']
  });

}

 formulario!: ReturnType<FormBuilder['group']>;

  ngOnInit(): void {

    this.productoId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.productoId) {
      this.error = 'ID de producto no válido';
      this.cargando = false;
      return;
    }

    this.cargarProducto();
  }

  cargarProducto(): void {

    this.adminProductosService
      .obtenerProducto(this.productoId)
      .subscribe({

        next: (productos) => {

          const producto = Array.isArray(productos)
            ? productos[0]
            : productos;

          if (!producto) {
            this.error = 'No se encontró el producto';
            this.cargando = false;
            this.cdr.detectChanges();
            return;
          }

          this.formulario.patchValue({
            nombreProducto: producto['nombreProducto'],
            slug: producto['slug'],
            descripcion: producto['descripcion'],
            precio: producto['precio'],
            stock: producto['stock'],
            pathImagen: producto['pathImagen']
          });

          this.cargando = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error obteniendo producto:',
            error
          );

          this.error = 'No se pudo cargar el producto';
          this.cargando = false;

          this.cdr.detectChanges();
        }

      });
  }

  guardar(): void {

    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();

      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    const datos = this.formulario.getRawValue();

    this.adminProductosService
      .actualizarProducto(this.productoId, datos)
      .subscribe({

        next: () => {

          this.mensaje =
            'Producto actualizado correctamente';

          this.guardando = false;

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/admin/admin-productos']);
          }, 800);
        },

        error: (error) => {

          console.error(
            'Error actualizando producto:',
            error
          );

          this.error =
            'No se pudo actualizar el producto';

          this.guardando = false;

          this.cdr.detectChanges();
        }

      });
  }

  /**
   * Selecciona la imagen del producto.
   */
  seleccionarImagen(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.imagenSeleccionada = null;
      this.previewImagen = null;
      return;
    }

    const archivo = input.files[0];

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {

      this.error =
        'El archivo seleccionado no es una imagen.';

      this.imagenSeleccionada = null;
      this.previewImagen = null;

      return;
    }

    // Validar tamaño: máximo 5 MB
    if (archivo.size > 5 * 1024 * 1024) {

      this.error =
        'La imagen no puede superar los 5 MB.';

      this.imagenSeleccionada = null;
      this.previewImagen = null;

      return;
    }

    this.error = '';

    this.imagenSeleccionada = archivo;

    // Crear vista previa
    const reader = new FileReader();

    reader.onload = () => {
      this.previewImagen =
        reader.result as string;
    };

    reader.readAsDataURL(archivo);
  }


  cancelar(): void {
    this.router.navigate(['/admin/admin-productos']);
  }
}