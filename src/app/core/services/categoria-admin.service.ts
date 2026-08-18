import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaAdmin, CategoriaFormValue } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class CategoriaAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/categorias`;

  listar(): Observable<CategoriaAdmin[]> {
    return this.http.get<CategoriaAdmin[]>(this.baseUrl);
  }

  criar(valor: CategoriaFormValue): Observable<CategoriaAdmin> {
    return this.http.post<CategoriaAdmin>(this.baseUrl, valor);
  }

  atualizar(id: number, valor: CategoriaFormValue): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, valor);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
