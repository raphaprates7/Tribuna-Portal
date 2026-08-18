import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Anexa o access token nas chamadas para a nossa API e envia o cookie do
 * refresh token (withCredentials). Em um 401 fora do próprio endpoint de
 * login/refresh, tenta renovar a sessão uma vez antes de desistir.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const ehRotaDeAuth = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  return next(authReq).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status !== 401 || ehRotaDeAuth) {
        return throwError(() => erro);
      }

      return authService.refresh().pipe(
        switchMap(() => {
          const novoToken = authService.getAccessToken();
          const retryReq = req.clone({
            withCredentials: true,
            setHeaders: novoToken ? { Authorization: `Bearer ${novoToken}` } : {},
          });
          return next(retryReq);
        }),
        catchError((erroRefresh) => throwError(() => erroRefresh))
      );
    })
  );
};
