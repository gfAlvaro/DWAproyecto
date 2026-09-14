import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, RoutesRecognized } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  initSeoTracking() {
    this.router.events.pipe(
      filter((event): event is RoutesRecognized => event instanceof RoutesRecognized)
    ).subscribe(event => {
      let route = event.state.root;
      while (route.firstChild) {
        route = route.firstChild;
      }

      const data = route.data;

      if (data && data['title']) {
        this.updateData(data['title'], data['description'] || '');
      }
    });
  }

  updateData(title: string, description: string) {
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
  }
}
