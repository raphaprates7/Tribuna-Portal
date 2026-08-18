import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArticleComment, ArticleDetail } from '../models/article.model';
import { BlogCategory } from '../models/blog.model';
import { formatarDataBr } from '../utils/date.util';

interface ArtigoDetailApi {
  id: number;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  resumo: string;
  conteudoHtml: string;
  imagemCapaUrl: string | null;
  publicadoEm: string | null;
  verticalNome: string;
  verticalSlug: string;
  categoriaNome: string | null;
  categoriaSlug: string | null;
  autorNome: string;
  relacionadosMesmaVertical: Array<{ slug: string; titulo: string; resumo: string; publicadoEm: string | null }>;
}

interface CategoriaApi {
  nome: string;
  slug: string;
  quantidadeArtigos: number;
}

interface ComentarioApi {
  id: number;
  nome: string;
  texto: string;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getArticle(slug: string): Observable<ArticleDetail> {
    return this.http.get<ArtigoDetailApi>(`${this.baseUrl}/artigos/${slug}`).pipe(
      switchMap((artigo) =>
        forkJoin({
          artigo: of(artigo),
          categorias: this.http.get<CategoriaApi[]>(`${this.baseUrl}/categorias`),
          comentarios: this.http.get<ComentarioApi[]>(`${this.baseUrl}/artigos/${artigo.id}/comentarios`),
        })
      ),
      map(({ artigo, categorias, comentarios }) => this.paraArticleDetail(artigo, categorias, comentarios))
    );
  }

  private paraArticleDetail(artigo: ArtigoDetailApi, categorias: CategoriaApi[], comentarios: ComentarioApi[]): ArticleDetail {
    const origem = typeof window !== 'undefined' ? window.location.origin : '';
    const urlArtigo = `${origem}/artigos/${artigo.slug}`;

    const categoriasDto: BlogCategory[] = categorias.map((c) => ({
      label: c.nome,
      count: c.quantidadeArtigos,
      href: `/blog?categoria=${c.slug}`,
      active: c.slug === artigo.categoriaSlug,
    }));

    const comentariosDto: ArticleComment[] = comentarios.map((c) => ({
      name: c.nome,
      date: c.criadoEm,
      text: c.texto,
    }));

    return {
      id: artigo.id,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: artigo.verticalNome, href: `/${artigo.verticalSlug}` },
        { label: artigo.titulo, href: '' },
      ],
      title: artigo.titulo,
      subtitle: artigo.subtitulo ?? '',
      summary: artigo.resumo,
      date: formatarDataBr(artigo.publicadoEm),
      author: artigo.autorNome,
      shareLinks: [
        { icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlArtigo)}`, label: 'Facebook' },
        { icon: 'whatsapp', href: `https://wa.me/?text=${encodeURIComponent(urlArtigo)}`, label: 'WhatsApp' },
        { icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlArtigo)}`, label: 'LinkedIn' },
        { icon: 'x', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlArtigo)}`, label: 'X' },
      ],
      heroImage: artigo.imagemCapaUrl,
      contentHtml: artigo.conteudoHtml,
      categories: categoriasDto,
      recentPosts: artigo.relacionadosMesmaVertical.map((r) => ({
        date: formatarDataBr(r.publicadoEm),
        excerpt: r.resumo,
        href: `/artigos/${r.slug}`,
      })),
      extras: [],
      comments: comentariosDto,
    };
  }
}
