import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BlogArticle, BlogCategory, BlogPageData, RecentPost } from '../models/blog.model';

interface ArtigoListItemApi {
  slug: string;
  titulo: string;
  resumo: string;
  imagemCapaUrl: string | null;
  patrocinado: boolean;
  publicadoEm: string | null;
}

interface PaginaResultApi<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
}

interface CategoriaApi {
  nome: string;
  slug: string;
  quantidadeArtigos: number;
}

const TAMANHO_PAGINA = 10;

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getBlogPage(categoria?: string, pagina = 1, busca?: string): Observable<BlogPageData> {
    let params = new HttpParams().set('pagina', pagina).set('tamanhoPagina', TAMANHO_PAGINA);
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    if (busca) {
      params = params.set('busca', busca);
    }

    return forkJoin({
      pagina: this.http.get<PaginaResultApi<ArtigoListItemApi>>(`${this.baseUrl}/artigos`, { params }),
      categorias: this.http.get<CategoriaApi[]>(`${this.baseUrl}/categorias`),
      recentes: this.http.get<PaginaResultApi<ArtigoListItemApi>>(`${this.baseUrl}/artigos`, {
        params: new HttpParams().set('pagina', 1).set('tamanhoPagina', 5),
      }),
    }).pipe(
      map(({ pagina: resultado, categorias, recentes }) => {
        const articles: BlogArticle[] = resultado.itens.map((a) => ({
          date: a.publicadoEm ?? '',
          title: a.titulo,
          excerpt: a.resumo,
          image: a.imagemCapaUrl,
          href: `/artigos/${a.slug}`,
          sponsored: a.patrocinado,
        }));

        const categoriesDto: BlogCategory[] = categorias.map((c) => ({
          label: c.nome,
          count: c.quantidadeArtigos,
          href: `/blog?categoria=${c.slug}`,
          active: c.slug === categoria,
        }));

        const recentPosts: RecentPost[] = recentes.itens.map((a) => ({
          date: a.publicadoEm ?? '',
          excerpt: a.titulo,
          href: `/artigos/${a.slug}`,
        }));

        const data: BlogPageData = {
          breadcrumbs: [
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
          ],
          pageTitle: categoria ? categorias.find((c) => c.slug === categoria)?.nome ?? 'Blog' : 'Blog',
          articles,
          categories: categoriesDto,
          recentPosts,
          extras: [],
          pagination: { current: resultado.paginaAtual, total: resultado.totalPaginas },
        };

        return data;
      })
    );
  }
}
