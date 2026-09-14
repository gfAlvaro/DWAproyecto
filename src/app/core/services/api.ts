import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiProductos = '/api/productos';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>( this.apiProductos );
  }

  getProducto(slug: string): Observable<any> {
    return this.http.get<any>( `${this.apiProductos}/${slug}` );
  }
}

