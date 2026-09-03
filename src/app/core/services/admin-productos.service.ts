import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../producto/producto';

@Injectable({
  providedIn: 'root'
})
export class AdminProductosService {

  private apiUrl = '/api/admin/productos';

  constructor(private http: HttpClient) {}

  // =========================
  // OBTENER TODOS
  // =========================
obtenerProductos(): Observable<Producto[]> {
  return this.http.get<Producto[]>(this.apiUrl);
}

  // =========================
  // OBTENER UNO
  // =========================
  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`
    );
  }

  // =========================
  // CREAR
  // =========================
  crearProducto(formData: FormData) {
  return this.http.post(
    '/api/productos',
    formData
  );
}

  // =========================
  // ACTUALIZAR
  // =========================
  actualizarProducto(
    id: number,
    producto: Producto
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      producto
    );
  }

  // =========================
  // ELIMINAR
  // =========================
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}