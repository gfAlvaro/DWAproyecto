import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'proyectoDWA';

  private http = inject(HttpClient);

  mensaje = '';

  probarApi() {
    this.http.get<{ mensaje: string }>('/api/hola')
      .subscribe({
        next: respuesta => {
          this.mensaje = respuesta.mensaje;
        },
        error: error => {
          console.error('Error API:', error);
          this.mensaje = 'Error al conectar con la API';
        }
      });
  }
}