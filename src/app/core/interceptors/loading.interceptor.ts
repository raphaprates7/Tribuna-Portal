import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Liga a barra de carregamento global durante qualquer chamada HTTP feita pelo app. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  loading.iniciar();
  return next(req).pipe(finalize(() => loading.finalizar()));
};
