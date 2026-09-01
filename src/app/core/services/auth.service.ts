import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Producto } from '../../producto/producto';

export interface Administrador {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'SUPER_ADMIN';
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  administrador: Administrador;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/admin';

  constructor(
    private http: HttpClient
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
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
}
