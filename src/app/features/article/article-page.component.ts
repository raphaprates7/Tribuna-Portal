import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map } from 'rxjs';
import { ArticleService } from '../../core/services/article.service';
import { ArticleDetail } from '../../core/models/article.model';
import { SeoService } from '../../core/services/seo.service';
import { FavoritosService } from '../../core/services/favoritos.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ContentSidebarComponent } from '../../shared/components/content-sidebar/content-sidebar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CommentSectionComponent } from './components/comment-section/comment-section.component';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ContentSidebarComponent, IconComponent, CommentSectionComponent],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePageComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);

  data = signal<ArticleDetail | null>(null);
  private slug = signal('');

  isFavorito = computed(() => this.favoritosService.favoritos().some((f) => f.slug === this.slug()));

  // O HTML já passa pelo sanitizador do backend (ConteudoSanitizerService) antes
  // de ser salvo — só admin/editor autenticado consegue gravar nesse campo, e lá
  // scripts/handlers inline são removidos e <iframe> só sobrevive se apontar pra
  // um host de embed de vídeo confiável (YouTube/Vimeo). O sanitizador padrão do
  // Angular no [innerHTML] removeria o <iframe> de qualquer forma, então essa
  // fonte específica (já confiável) precisa desse bypass pro embed aparecer.
  contentHtmlSeguro = computed<SafeHtml | null>(() => {
    const conteudo = this.data()?.contentHtml;
    return conteudo ? this.sanitizer.bypassSecurityTrustHtml(conteudo) : null;
  });

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private seo: SeoService,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          return this.articleService.getArticle(slug).pipe(map((data) => ({ data, slug })));
        })
      )
      .subscribe(({ data, slug }) => {
        this.data.set(data);
        this.slug.set(slug);
        this.seo.update({
          title: `${data.title} — Tribuna`,
          description: data.subtitle || data.summary,
          image: data.heroImage,
          path: `/artigos/${slug}`,
        });
      });
  }

  alternarFavorito(): void {
    const data = this.data();
    if (!data) {
      return;
    }
    this.favoritosService.alternar({
      slug: this.slug(),
      title: data.title,
      image: data.heroImage,
      date: data.date,
    });
  }
}
