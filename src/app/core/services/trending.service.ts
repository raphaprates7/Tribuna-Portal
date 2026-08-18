import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrendingItem } from '../models/home.model';

interface ArtigoListItemApi {
  slug: string;
  titulo: string;
}

/**
 * "Em alta" é baseado em visualizações reais (contador incrementado no
 * backend a cada leitura de artigo) — não é uma lista curada manualmente.
 */
@Injectable({ providedIn: 'root' })
export class TrendingService {
  private http = inject(HttpClient);

  getTrending(quantidade = 4, vertical?: string): Observable<TrendingItem[]> {
    let params = new HttpParams().set('quantidade', quantidade);
    if (vertical) {
      params = params.set('vertical', vertical);
    }
    return this.http.get<ArtigoListItemApi[]>(`${environment.apiBaseUrl}/artigos/em-alta`, { params }).pipe(
      map((artigos) =>
        artigos.map((a, i) => ({
          rank: i + 1,
          title: a.titulo,
          href: `/artigos/${a.slug}`,
        }))
      )
    );
  }
}
