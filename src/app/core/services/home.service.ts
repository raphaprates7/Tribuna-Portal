import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContentCard, FeaturedArticle, HomePageData } from '../models/home.model';
import { TrendingService } from './trending.service';

interface ArtigoListItemApi {
  slug: string;
  titulo: string;
  resumo: string;
  imagemCapaUrl: string | null;
  patrocinado: boolean;
  verticalNome: string;
}

interface PaginaResultApi<T> {
  itens: T[];
}

// Só o que não é matéria (patrocínio, selos, painel de estatísticas) ainda
// vem de um JSON estático — não é conteúdo editorial, é vitrine/config visual.
interface HomeChrome {
  healthStats: HomePageData['healthStats'];
  contentCategories: HomePageData['contentCategories'];
  sponsored: HomePageData['sponsored'];
  trustBadges: HomePageData['trustBadges'];
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private trendingService = inject(TrendingService);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly chromeEndpoint = 'assets/mock/home.json';

  getHomePage(): Observable<HomePageData> {
    const paramsDestaque = new HttpParams().set('quantidade', 5);
    const paramsListagem = new HttpParams().set('pagina', 1).set('tamanhoPagina', 9);

    return forkJoin({
      chrome: this.http.get<HomeChrome>(this.chromeEndpoint),
      destaques: this.http.get<ArtigoListItemApi[]>(`${this.baseUrl}/artigos/destaque`, { params: paramsDestaque }),
      artigos: this.http.get<PaginaResultApi<ArtigoListItemApi>>(`${this.baseUrl}/artigos`, { params: paramsListagem }),
      trending: this.trendingService.getTrending(4),
    }).pipe(
      map(({ chrome, destaques, artigos, trending }) => {
        const destaquesEfetivos = destaques.length > 0 ? destaques : artigos.itens.slice(0, 1);
        const slugsDestaque = new Set(destaquesEfetivos.map((a) => a.slug));

        const featuredArticles: FeaturedArticle[] = destaquesEfetivos.map((a) => ({
          eyebrow: a.verticalNome,
          title: a.titulo,
          excerpt: a.resumo,
          ctaLabel: 'Leia o conteúdo',
          href: `/artigos/${a.slug}`,
          image: a.imagemCapaUrl,
        }));

        const contentCards: ContentCard[] = artigos.itens
          .filter((a) => !slugsDestaque.has(a.slug))
          .slice(0, 4)
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
          featuredArticles,
          trending,
          contentCards,
          healthStats: chrome.healthStats,
          contentCategories: chrome.contentCategories,
          sponsored: chrome.sponsored,
          trustBadges: chrome.trustBadges,
        };
      })
    );
  }
}
