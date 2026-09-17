import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from "@angular/router";
import { SeoService } from './core/services/seo.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatbotService } from './core/services/chatbot.service';

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

 constructor(private seoService: SeoService,
    private router: Router,
    private chatbotService: ChatbotService
 ) {}

  ngOnInit() {
    this.seoService.initSeoTracking();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlActual = event.urlAfterRedirects;

      const esZonaPrivada = urlActual.includes('/admin') || urlActual.includes('/client');

      if (esZonaPrivada) {
        this.chatbotService.ocultar();
      } else {
        this.chatbotService.mostrar();
      }
    });
  }
}