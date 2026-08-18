import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  enviarImagem(arquivo: File): Observable<string> {
    const form = new FormData();
    form.append('arquivo', arquivo);

    return this.http
      .post<{ url: string }>(`${environment.apiBaseUrl}/uploads/imagem`, form)
      .pipe(map((r) => `${environment.apiOrigin}${r.url}`));
  }
}
