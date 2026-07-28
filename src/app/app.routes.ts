import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { SesionForm } from './sesion-form/sesion-form';
import { SobreNosotros } from './sobre-nosotros/sobre-nosotros';
import { Productos } from './productos/productos';
import { Contacto } from './contacto/contacto';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'sesion-form', component: SesionForm },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: 'productos', component: Productos },
  { path: 'contacto', component: Contacto }
];
