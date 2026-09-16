import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss' 
})

export class ContactForm {
  contactoForm: FormGroup;
  enviando = false;
  mensajeEstado = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactoForm.invalid) {
      return;
    }

    this.enviando = true;
    this.mensajeEstado = '';
    const urlApi = 'https://alvarogfv1-2526.proyectosdwa.es/api/contacto';

    this.http.post(urlApi, this.contactoForm.value).subscribe({
      next: (response: any) => {
        this.enviando = false;
        this.mensajeEstado = '¡Mensaje enviado con éxito!';
        this.contactoForm.reset();
      },
      error: (error) => {
        this.enviando = false;
        this.mensajeEstado = 'Hubo un error al enviar el mensaje. Inténtalo de nuevo.';
        console.error(error);
      }
    });
  }
}
