import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Cliente {
  clienteID: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
}

export interface Pedido {
  pedidoID: number;
  clienteID: number;
  fechaPedido: string;
  total: number;
}

export interface DetallePedido {
  pedidoID: number;
  fechaPedido: string;
  total: number;
  articulos: {
    cantidad: number;
    precioUnitario: number;
    nombreProducto: string;
    subtotal: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})

export class ClienteService {

  private apiUrl = '/api/cliente';
  private nombreUsuarioSubject = new BehaviorSubject<string>('');
  nombreUsuario$ = this.nombreUsuarioSubject.asObservable();

  constructor(private http: HttpClient) {}  

  obtenerPerfil(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/me`);
  }

  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos`);
  }

  obtenerPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }

  obtenerDetallePedido(id: string): Observable<DetallePedido> {
    return this.http.get<DetallePedido>(`${this.apiUrl}/pedidos/${id}`);
  }

  actualizarPerfil(datos: Partial<Cliente>): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/perfil`, datos);
  }

  actualizarNombreEnPantalla(nuevoNombre: string): void {
    this.nombreUsuarioSubject.next(nuevoNombre);
  }

  cambiarPassword(datos: any): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/seguridad`, datos);
  }

  crearPedidoMaestro(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/maestro`, datos);
  }

  crearPedidoDetalle(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/detalle`, datos);
  }
}