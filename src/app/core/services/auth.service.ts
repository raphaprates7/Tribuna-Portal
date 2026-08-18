import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../models/auth.model';

/**
 * O access token vive só em memória (nunca em localStorage/sessionStorage) —
 * assim um XSS na página não consegue lê-lo. A sessão persiste entre reloads
 * via refresh token, que fica em cookie HttpOnly controlado pela API.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  private accessToken = signal<string | null>(null);
  readonly usuario = signal<{ email: string; nomeCompleto: string; roles: string[] } | null>(null);
  readonly isAdmin = computed(() => this.usuario()?.roles.includes('Admin') ?? false);
  readonly isEditorial = computed(() => {
    const roles = this.usuario()?.roles ?? [];
    return roles.includes('Admin') || roles.includes('Editor');
  });

  private tentativaRestauro: Observable<boolean> | null = null;

  getAccessToken(): string | null {
    return this.accessToken();
  }

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, dto, { withCredentials: true })
      .pipe(tap((resposta) => this.aplicarResposta(resposta)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
      .pipe(tap((resposta) => this.aplicarResposta(resposta)));
  }

  esqueciSenha(email: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.baseUrl}/esqueci-senha`, { email });
  }

  redefinirSenha(email: string, token: string, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/redefinir-senha`, { email, token, novaSenha });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken.set(null);
        this.usuario.set(null);
      })
    );
  }

  /**
   * Usado pelo guard de rotas /admin: se já há sessão em memória, resolve na
   * hora; senão tenta uma vez restaurar via cookie de refresh (ex.: após F5).
   * Cacheia a tentativa em voo para não disparar N refreshes em paralelo.
   */
  garantirSessao(): Observable<boolean> {
    if (this.usuario()) {
      return of(true);
    }

    if (!this.tentativaRestauro) {
      this.tentativaRestauro = this.refresh().pipe(
        map(() => true),
        catchError(() => of(false)),
        tap(() => (this.tentativaRestauro = null)),
        shareReplay(1)
      );
    }

    return this.tentativaRestauro;
  }

  private aplicarResposta(resposta: AuthResponse): void {
    this.accessToken.set(resposta.accessToken);
    this.usuario.set({
      email: resposta.email,
      nomeCompleto: resposta.nomeCompleto,
      roles: resposta.roles,
    });
  }
}
