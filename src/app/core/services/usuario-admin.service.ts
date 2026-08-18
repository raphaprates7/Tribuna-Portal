import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CriarUsuarioForm, UsuarioAdmin } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class UsuarioAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth/usuarios`;

  listar(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.baseUrl);
  }

  criar(valor: CriarUsuarioForm): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(this.baseUrl, valor);
  }

  alterarStatus(id: string, ativo: boolean): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/status`, ativo);
  }
}
