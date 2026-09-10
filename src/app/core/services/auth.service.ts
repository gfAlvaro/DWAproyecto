import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Administrador {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'SUPER_ADMIN';
}

export interface Cliente {
  clienteID: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  administrador: Administrador;
}

export interface ClienteLoginResponse {
  mensaje: string;
  token: string;
  cliente: Cliente;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api';

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // LOGIN ADMINISTRADOR
  // ==========================================

  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/admin/login`,
      {
        email,
        password
      }
    ).pipe(

      tap(response => {

        localStorage.setItem(
          'admin_token',
          response.token
        );

        localStorage.setItem(
          'admin',
          JSON.stringify(response.administrador)
        );

      })

    );
  }


  // ==========================================
  // LOGIN CLIENTE
  // ==========================================

  loginCliente(
    email: string,
    password: string
  ): Observable<ClienteLoginResponse> {

    return this.http.post<ClienteLoginResponse>(
      `${this.apiUrl}/cliente/login`,
      {
        email,
        password
      }
    ).pipe(

      tap(response => {

        localStorage.setItem(
          'cliente_token',
          response.token
        );

        localStorage.setItem(
          'cliente',
          JSON.stringify(response.cliente)
        );

      })

    );
  }


  // ==========================================
  // ADMINISTRADOR
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem('admin_token');

  }


  getAdministrador(): Administrador | null {

    const admin = localStorage.getItem('admin');

    if (!admin) {
      return null;
    }

    try {

      return JSON.parse(admin);

    } catch {

      return null;

    }

  }


  estaAutenticado(): boolean {

    return !!this.getToken();

  }


  logout(): void {

    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');

  }


  // ==========================================
  // CLIENTE
  // ==========================================

  getClienteToken(): string | null {

    return localStorage.getItem('cliente_token');

  }


  getCliente(): Cliente | null {

    const cliente = localStorage.getItem('cliente');

    if (!cliente) {
      return null;
    }

    try {

      return JSON.parse(cliente);

    } catch {

      return null;

    }

  }


  clienteEstaAutenticado(): boolean {

    return !!this.getClienteToken();

  }


  logoutCliente(): void {

    localStorage.removeItem('cliente_token');
    localStorage.removeItem('cliente');

  }

}

