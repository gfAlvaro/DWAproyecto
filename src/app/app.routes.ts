import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Login } from './client/login/login';
import { SobreNosotros } from './sobre-nosotros/sobre-nosotros';
import { Productos } from './productos/productos';
import { ContactForm } from './contacto/contacto';
import { Producto } from './producto/producto';
import { adminGuard } from './guards/admin.guard';
import { clienteGuard } from './guards/client.guard';
import { PublicLayout } from './public-layout/public-layout';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { MiCuenta } from './client/mi-cuenta/mi-cuenta';

export const routes: Routes = [

  // PARTE PÚBLICA
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Inicio, data: { title: 'Inicio | Fractals', description: 'Tu tienda online.' } },
      { path: 'login', component: Login, data: { title: 'Login | Fractals', description: 'Inicia sesión en tu cuenta.' }  },
      { path: 'sobre-nosotros', component: SobreNosotros, data: { title: 'Sobre Nosotros | Fractals', description: 'Conoce más sobre nosotros.' }  },
      { path: 'productos', component: Productos, data: { title: 'Nuestros Productos | Fractals', description: 'Explora nuestra selección de productos.' }  },
      { path: 'productos/:slug', component: Producto },
      { path: 'contacto', component: ContactForm, data: { title: 'Contacto | Fractals', description: 'Contáctanos para más información.' } }
    ]
  },

  // ÁREA DE CLIENTE
  {
    path: 'mi-cuenta',
    component: MiCuenta,
    canActivate: [clienteGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./client/carrito/carrito')
            .then(m => m.Carrito)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./client/pedidos/pedidos')
            .then(m => m.Pedidos)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./client/detalle-pedido/detalle-pedido')
            .then(m => m.DetallePedidos)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./client/perfil/perfil')
            .then(m => m.Perfil)
      },
      {
        path: 'seguridad',
        loadComponent: () =>
          import('./client/seguridad/seguridad')
            .then(m => m.Seguridad)
      }
    ]
  },

  // ADMIN
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
        path: 'nuevo-producto',
        loadComponent: () =>
          import('./admin/crear-producto/crear-producto')
            .then(m => m.CrearProducto)
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
