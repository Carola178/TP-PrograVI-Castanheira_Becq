import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const esAdmin = await auth.esAdmin();
  console.log('¿Es admin?:', esAdmin);

  if (esAdmin) {
    return true;
  }

  router.navigate(['/cartelera']);
  return false;
};