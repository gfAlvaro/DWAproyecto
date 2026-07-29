import { Component } from '@angular/core';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-api-mensajes',
  imports: [],
  templateUrl: './api-mensajes.html',
  styleUrl: './api-mensajes.scss',
})
export class ApiMensajes {
  constructor(private api: ApiService) {}

ngOnInit() {
  this.api.prueba().subscribe(console.log);
}
}


