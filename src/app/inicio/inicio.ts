import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements AfterViewInit, OnDestroy {

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const secciones = document.querySelectorAll('.section');

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    secciones.forEach((seccion) => {
      this.observer?.observe(seccion);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}