import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  prueba() {
    return this.http.get(`${this.url}/prueba`);
  }
}
