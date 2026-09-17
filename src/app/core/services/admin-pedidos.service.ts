import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AdminPedidosService {

  private apiUrl = '/api/admin/pedidos';

  constructor(private http: HttpClient) {}

  obtenerPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  cambiarEstado(pedidoID: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${pedidoID}/estado`, { nuevoEstado });
  }

  getDetallesPedido(pedidoID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${pedidoID}/detalles`);
  }

}
