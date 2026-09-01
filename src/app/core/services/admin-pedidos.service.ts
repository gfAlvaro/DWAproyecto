import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AdminPedidosService {

  private apiUrl = '/api/admin/pedidos';

  constructor(private http: HttpClient) {}

  // =========================
  // OBTENER TODOS
  // =========================
  obtenerPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
