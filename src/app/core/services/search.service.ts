import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SearchResult } from '../models/search.model';

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Reads from a static mock JSON today. To wire up the real API, swap
 * `endpoint` for the backend base URL — the return shape stays the same.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private readonly endpoint = 'assets/mock/search-index.json';

  search(query: string): Observable<SearchResult[]> {
    const needle = normalize(query.trim());
    return this.http.get<SearchResult[]>(this.endpoint).pipe(
      map((results) =>
        needle
          ? results.filter(
              (r) => normalize(r.title).includes(needle) || normalize(r.excerpt).includes(needle)
            )
          : results
      )
    );
  }
}
