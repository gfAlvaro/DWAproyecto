import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AdminClientesService {

  private apiUrl = '/api/admin/clientes';

  constructor(private http: HttpClient) {}

  // =========================
  // OBTENER TODOS
  // =========================
  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
