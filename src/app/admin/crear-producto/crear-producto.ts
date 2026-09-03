import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AdminProductosService } from '../../core/services/admin-productos.service';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.scss'
})
export class CrearProducto {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private adminProductosService =
    inject(AdminProductosService);

  guardando = false;
  error = '';

  // Imagen seleccionada desde el ordenador
  imagenSeleccionada: File | null = null;

  // Vista previa de la imagen
  previewImagen: string | null = null;


  productoForm = this.fb.group({

    nombreProducto: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    slug: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    descripcion: [
      ''
    ],

    precio: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    stock: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ]

  });


  /**
   * Convierte el nombre del producto
   * en un slug.
   */
  generarSlug(): void {

    const nombre =
      this.productoForm.controls.nombreProducto.value || '';

    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    this.productoForm.controls.slug.setValue(slug);
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


  /**
   * Guarda el producto en la API.
   */
  guardarProducto(): void {

    if (this.productoForm.invalid) {

      this.productoForm.markAllAsTouched();

      return;
    }

    this.guardando = true;
    this.error = '';

    const formData = new FormData();

    formData.append(
      'nombreProducto',
      this.productoForm.controls.nombreProducto.value!
    );

    formData.append(
      'slug',
      this.productoForm.controls.slug.value!
    );

    formData.append(
      'descripcion',
      this.productoForm.controls.descripcion.value || ''
    );

    formData.append(
      'precio',
      String(this.productoForm.controls.precio.value)
    );

    formData.append(
      'stock',
      (
        this.productoForm.controls.stock.value ?? 0
      ).toString()
    );


    // Añadir imagen únicamente si se ha seleccionado
    if (this.imagenSeleccionada) {

      formData.append(
        'imagen',
        this.imagenSeleccionada
      );

    }


    this.adminProductosService
      .crearProducto(formData)
      .subscribe({

        next: () => {

          this.guardando = false;

          this.router.navigate([
            '/admin/admin-productos'
          ]);

        },

        error: (error) => {

          console.error(
            'Error creando producto:',
            error
          );

          this.guardando = false;

          if (error.status === 409) {

            this.error =
              'Ya existe un producto con ese slug.';

          } else if (error.status === 400) {

            this.error =
              error.error?.message ||
              'Los datos enviados no son válidos.';

          } else {

            this.error =
              'No se ha podido crear el producto.';

          }

        }

      });

  }


  cancelar(): void {

    this.router.navigate([
      '/admin/admin-productos'
    ]);

  }

}