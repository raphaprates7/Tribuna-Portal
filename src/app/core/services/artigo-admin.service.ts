import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArtigoAdmin, ArtigoFormValue, PaginaResult } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class ArtigoAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/artigos`;

  listar(pagina = 1, tamanhoPagina = 20): Observable<PaginaResult<ArtigoAdmin>> {
    const params = new HttpParams().set('pagina', pagina).set('tamanhoPagina', tamanhoPagina);
    return this.http.get<PaginaResult<ArtigoAdmin>>(`${this.baseUrl}/gerenciar`, { params });
  }

  obter(id: number): Observable<ArtigoAdmin> {
    return this.http.get<ArtigoAdmin>(`${this.baseUrl}/gerenciar/${id}`);
  }

  criar(valor: ArtigoFormValue): Observable<void> {
    return this.http.post<void>(this.baseUrl, valor);
  }

  atualizar(id: number, valor: ArtigoFormValue): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, valor);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
