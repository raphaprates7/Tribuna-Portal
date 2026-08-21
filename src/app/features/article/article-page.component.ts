import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  data = signal<ArticleDetail | null>(null);
  emModoPreview = signal(false);
  linkCopiado = signal(false);
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
    const preview = this.route.snapshot.data['preview'] === true;
    this.emModoPreview.set(preview);

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          if (preview) {
            const id = Number(params.get('id'));
            // Favoritar não faz sentido numa prévia (rascunho pode nem ter
            // slug público ainda); "slug" fica vazio de propósito aqui.
            return this.articleService.getArticlePreview(id).pipe(map((data) => ({ data, slug: '' })));
          }
          const slug = params.get('slug') ?? '';
          return this.articleService.getArticle(slug).pipe(map((data) => ({ data, slug })));
        })
      )
      .subscribe(({ data, slug }) => {
        this.data.set(data);
        this.slug.set(slug);
        if (!preview) {
          this.seo.update({
            title: `${data.title} — Tribuna`,
            description: data.subtitle || data.summary,
            image: data.heroImage,
            path: `/artigos/${slug}`,
          });
        }
      });
  }

  copiarLink(): void {
    if (!this.isBrowser) {
      return;
    }

    const mostrarConfirmacao = () => {
      this.linkCopiado.set(true);
      setTimeout(() => this.linkCopiado.set(false), 2000);
    };

    // navigator.clipboard.writeText pode falhar (permissão negada, contexto
    // não seguro, navegador antigo) — sem isso o clique não faz nada
    // visível e a pessoa acha que o botão está quebrado. execCommand é
    // depreciado mas ainda amplamente suportado como último recurso.
    navigator.clipboard.writeText(window.location.href).then(mostrarConfirmacao, () => {
      const campo = document.createElement('textarea');
      campo.value = window.location.href;
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      try {
        // execCommand retorna um boolean de sucesso — sem checar, o botão
        // afirmaria "copiado" mesmo quando a cópia genuinamente falhou.
        if (document.execCommand('copy')) {
          mostrarConfirmacao();
        }
      } finally {
        document.body.removeChild(campo);
      }
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
