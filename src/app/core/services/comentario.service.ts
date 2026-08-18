import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArticleComment } from '../models/article.model';
import { formatarDataBr } from '../utils/date.util';

export interface ComentarioApi {
  id: number;
  nome: string;
  texto: string;
  criadoEm: string;
  curtidas: number;
  curtidoPeloUsuarioAtual: boolean;
}

interface CurtirResponse {
  curtido: boolean;
  totalCurtidas: number;
}

export function paraArticleComment(c: ComentarioApi): ArticleComment {
  return {
    id: c.id,
    name: c.nome,
    date: formatarDataBr(c.criadoEm),
    text: c.texto,
    curtidas: c.curtidas,
    curtidoPeloUsuarioAtual: c.curtidoPeloUsuarioAtual,
  };
}

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listar(articleId: number): Observable<ArticleComment[]> {
    return this.http
      .get<ComentarioApi[]>(`${this.baseUrl}/artigos/${articleId}/comentarios`)
      .pipe(map((comentarios) => comentarios.map(paraArticleComment)));
  }

  criar(articleId: number, texto: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.baseUrl}/artigos/${articleId}/comentarios`, { texto });
  }

  curtir(comentarioId: number): Observable<CurtirResponse> {
    return this.http.post<CurtirResponse>(`${this.baseUrl}/comentarios/${comentarioId}/curtir`, {});
  }
}
