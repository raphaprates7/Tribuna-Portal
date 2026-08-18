import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.garantirSessao().pipe(
    map((autenticado) => {
      if (autenticado && auth.isEditorial()) {
        return true;
      }
      return router.createUrlTree(['/cadastre-se'], { queryParams: { redirect: state.url } });
    })
  );
};

// Telas restritas a Admin (gestão de usuários, categorias).
export const adminOnlyGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.garantirSessao().pipe(
    map((autenticado) => {
      if (autenticado && auth.isAdmin()) {
        return true;
      }
      return router.createUrlTree(['/admin']);
    })
  );
};
