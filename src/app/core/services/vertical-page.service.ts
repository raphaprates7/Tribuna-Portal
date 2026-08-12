import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VerticalPageData } from '../models/vertical.model';

/**
 * Reads from a static mock JSON per slug today. To wire up the real API,
 * swap `basePath` for the backend base URL — the return shape stays the same.
 */
@Injectable({ providedIn: 'root' })
export class VerticalPageService {
  private http = inject(HttpClient);
  private readonly basePath = 'assets/mock/verticals';

  getPage(slug: string): Observable<VerticalPageData> {
    return this.http.get<VerticalPageData>(`${this.basePath}/${slug}.json`);
  }
}
