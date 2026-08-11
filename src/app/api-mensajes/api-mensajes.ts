import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-api-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-mensajes.html'
})
export class AppComponent implements OnInit {

  constructor(private dataService: ApiService) {}
  clientes$!: Observable<any[]>;

  ngOnInit() {
  this.clientes$! = this.dataService.getClientes();
  }
  
}
