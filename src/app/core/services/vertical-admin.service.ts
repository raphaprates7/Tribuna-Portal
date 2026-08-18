import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VerticalAdmin, VerticalFormValue } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class VerticalAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/verticais`;

  listar(): Observable<VerticalAdmin[]> {
    return this.http.get<VerticalAdmin[]>(this.baseUrl);
  }

  criar(valor: VerticalFormValue): Observable<VerticalAdmin> {
    return this.http.post<VerticalAdmin>(this.baseUrl, valor);
  }

  atualizar(id: number, valor: VerticalFormValue): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, valor);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
