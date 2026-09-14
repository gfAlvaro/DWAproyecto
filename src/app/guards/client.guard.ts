import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

export const clienteGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.clienteEstaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};