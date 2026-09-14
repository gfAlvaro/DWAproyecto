import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from "@angular/router";
import { SeoService } from './core/services/seo.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'proyectoDWA';

  private http = inject(HttpClient);

  mensaje = '';

 constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.initSeoTracking();
  }
}