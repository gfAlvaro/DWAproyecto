import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.scss']
})

export class Contacto {

  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  send() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.http.post(
      'https://tu-api.com/contacto',
      this.contactForm.value
    ).subscribe({
      next: () => {
        alert('Mensaje enviado');
        this.contactForm.reset();
      },
      error: () => {
        alert('Ha ocurrido un error');
      }
    });
  }
}
