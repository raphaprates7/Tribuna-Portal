import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SearchResult } from '../models/search.model';

interface ArtigoListItemApi {
  slug: string;
  titulo: string;
  resumo: string;
  imagemCapaUrl: string | null;
  publicadoEm: string | null;
}

interface PaginaResultApi<T> {
  itens: T[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  search(query: string): Observable<SearchResult[]> {
    let params = new HttpParams().set('pagina', 1).set('tamanhoPagina', 20);
    const termo = query.trim();
    if (termo) {
      params = params.set('busca', termo);
    }

    return this.http.get<PaginaResultApi<ArtigoListItemApi>>(`${this.baseUrl}/artigos`, { params }).pipe(
      map((resultado) =>
        resultado.itens.map((a) => ({
          title: a.titulo,
          excerpt: a.resumo,
          href: `/artigos/${a.slug}`,
          image: a.imagemCapaUrl,
          date: a.publicadoEm ?? '',
        }))
      )
    );
  }
}
