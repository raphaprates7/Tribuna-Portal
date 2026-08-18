import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComentarioModeracao } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class ComentarioAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listarPendentes(): Observable<ComentarioModeracao[]> {
    return this.http.get<ComentarioModeracao[]>(`${this.baseUrl}/comentarios/pendentes`);
  }

  aprovar(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/comentarios/${id}/aprovar`, {});
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comentarios/${id}`);
  }
}
