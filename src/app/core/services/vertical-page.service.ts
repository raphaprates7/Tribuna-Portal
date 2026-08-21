import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VerticalPageData } from '../models/vertical.model';
import { ContentCard, FeaturedArticle, TrendingItem } from '../models/home.model';
import { TrendingService } from './trending.service';

interface VerticalApi {
  nome: string;
  slug: string;
  tagline: string | null;
  descricao: string | null;
  corAccent: string | null;
  corAccentDark: string | null;
  corAccentTint: string | null;
  temaEscuro: boolean;
}

interface ArtigoListItemApi {
  slug: string;
  titulo: string;
  resumo: string;
  imagemCapaUrl: string | null;
  patrocinado: boolean;
}

interface PaginaResultApi<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
}

const ACCENT_PADRAO = '#6e1423';
const ACCENT_DARK_PADRAO = '#520f1a';
const ACCENT_TINT_PADRAO = '#f7ebec';

@Injectable({ providedIn: 'root' })
export class VerticalPageService {
  private http = inject(HttpClient);
  private trendingService = inject(TrendingService);
  private readonly baseUrl = environment.apiBaseUrl;

  getPage(slug: string, pagina = 1): Observable<VerticalPageData> {
    const paramsListagem = new HttpParams().set('vertical', slug).set('pagina', pagina).set('tamanhoPagina', 10);
    const paramsDestaque = new HttpParams().set('vertical', slug).set('quantidade', 5);

    return forkJoin({
      vertical: this.http.get<VerticalApi>(`${this.baseUrl}/verticais/${slug}`),
      artigos: this.http.get<PaginaResultApi<ArtigoListItemApi>>(`${this.baseUrl}/artigos`, { params: paramsListagem }),
      destaques: this.http.get<ArtigoListItemApi[]>(`${this.baseUrl}/artigos/destaque`, { params: paramsDestaque }),
      trending: this.trendingService.getTrending(4, slug),
    }).pipe(
      map(({ vertical, artigos, destaques, trending }) =>
        this.paraVerticalPageData(vertical, artigos, destaques, trending)
      )
    );
  }

  private paraVerticalPageData(
    vertical: VerticalApi,
    artigosPagina: PaginaResultApi<ArtigoListItemApi>,
    destaques: ArtigoListItemApi[],
    trending: TrendingItem[]
  ): VerticalPageData {
    const artigos = artigosPagina.itens;
    // Se não há nenhum artigo marcado como destaque nessa vertical, usa o mais
    // recente como fallback — assim a página não fica sem "capa" nunca.
    const destaquesEfetivos = destaques.length > 0 ? destaques : artigos.slice(0, 1);
    const slugsDestaque = new Set(destaquesEfetivos.map((a) => a.slug));

    const featuredArticles: FeaturedArticle[] = destaquesEfetivos.map((a) => ({
      eyebrow: vertical.nome,
      title: a.titulo,
      excerpt: a.resumo,
      ctaLabel: 'Leia mais',
      href: `/artigos/${a.slug}`,
      image: a.imagemCapaUrl,
    }));

    const cards: ContentCard[] = artigos
      .filter((a) => !slugsDestaque.has(a.slug))
      .map((a) => ({
        icon: 'doc',
        title: a.titulo,
        image: a.imagemCapaUrl,
        excerpt: a.resumo,
        linkLabel: 'Ler mais',
        href: `/artigos/${a.slug}`,
        sponsored: a.patrocinado,
      }));

    return {
      slug: vertical.slug,
      name: vertical.nome,
      tagline: vertical.tagline ?? '',
      intro: vertical.descricao ?? '',
      theme: {
        accent: vertical.corAccent ?? ACCENT_PADRAO,
        accentDark: vertical.corAccentDark ?? vertical.corAccent ?? ACCENT_DARK_PADRAO,
        accentTint: vertical.corAccentTint ?? ACCENT_TINT_PADRAO,
        dark: vertical.temaEscuro,
      },
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: vertical.nome, href: '' },
      ],
      featuredArticles,
      trending,
      cards,
      pagination: {
        current: artigosPagina.paginaAtual,
        total: artigosPagina.totalPaginas,
      },
    };
  }
}
