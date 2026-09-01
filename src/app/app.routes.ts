import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { SesionForm } from './sesion-form/sesion-form';
import { SobreNosotros } from './sobre-nosotros/sobre-nosotros';
import { Productos } from './productos/productos';
import { Contacto } from './contacto/contacto';
import { Producto } from './producto/producto';
import { adminGuard } from './guards/admin.guard';
import { PublicLayout } from './public-layout/public-layout';
import { AdminLayout } from './admin/admin-layout/admin-layout';

export const routes: Routes = [

  // =========================
  // PARTE PÚBLICA
  // =========================
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Inicio },
      { path: 'sesion-form', component: SesionForm },
      { path: 'sobre-nosotros', component: SobreNosotros },
      { path: 'productos', component: Productos },
      { path: 'productos/:slug', component: Producto },
      { path: 'contacto', component: Contacto }
    ]
  },

  // =========================
  // ADMIN
  // =========================
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./admin/clientes/clientes')
            .then(m => m.AdminClientes)
      },
      {
        path: 'admin-productos',
        loadComponent: () => {
          return import('./admin/admin-productos/admin-productos')
            .then(m => {
              return m.AdminProductos;
            });
        }
      },

      {
        path: 'editar-producto/:id',
        loadComponent: () =>
          import('./admin/editar-producto/editar-producto')
            .then(m => m.EditarProducto)
      },

      {
        path: 'pedidos',
        loadComponent: () =>
          import('./admin/pedidos/pedidos')
            .then(m => m.AdminPedidos)
      },

      {
        path: 'detalles-pedido',
        loadComponent: () =>
          import('./admin/detalles-pedido/detalles-pedido')
            .then(m => m.DetallesPedido)
      }

    ]
  },

  // LOGIN ADMIN
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/login/login')
        .then(m => m.Login)
  }
];
