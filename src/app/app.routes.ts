import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { SesionForm } from './sesion-form/sesion-form';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'sesion-form', component: SesionForm }
];
