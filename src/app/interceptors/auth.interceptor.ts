import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  let token: string | null = null;

  // Rutas de administrador
  if (req.url.includes('/api/admin/')) {
    token = localStorage.getItem('admin_token');
  }

  // Rutas de cliente
  else if (req.url.includes('/api/cliente/')) {
    token = localStorage.getItem('cliente_token');
  }

  // Si no hay token, dejamos pasar la petición
  if (!token) {
    return next(req);
  }

  const request = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(request);
};