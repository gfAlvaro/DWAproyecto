import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {


  private apiClientes = '/api/clientes';
  private apiProductos = '/api/productos';


  constructor(private http: HttpClient) { }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiClientes);
  }

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiProductos);
  }


  getProducto(slug: string): Observable<any> {
    console.log('🌐 Solicitando:', `${this.apiProductos}/${slug}`);

    return this.http.get<any>(
      `${this.apiProductos}/${slug}`
    );
  }

}

