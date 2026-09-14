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

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>( this.apiUrl );
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>( `${this.apiUrl}/${id}` );
  }

  crearProducto(formData: FormData) {
    return this.http.post( this.apiUrl, formData );
  }

  actualizarProducto(id: number, formData: FormData) {
    return this.http.put( `/api/admin/productos/${id}`, formData );
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete( `${this.apiUrl}/${id}` );
  }
}