import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { BlogPageData } from '../../core/models/blog.model';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { ContentSidebarComponent } from '../../shared/components/content-sidebar/content-sidebar.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ArticleCardComponent, ContentSidebarComponent, PaginationComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent implements OnInit {
  data = signal<BlogPageData | null>(null);

  private categoria: string | undefined;
  private busca: string | undefined;

  constructor(private blogService: BlogService, private seo: SeoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.categoria = params.get('categoria') ?? undefined;
    this.busca = params.get('busca') ?? undefined;
    const pagina = Number(params.get('pagina')) || 1;

    this.carregar(pagina);
  }

  onPageChange(page: number): void {
    this.carregar(page);
  }

  private carregar(pagina: number): void {
    this.blogService.getBlogPage(this.categoria, pagina, this.busca).subscribe((data) => {
      this.data.set(data);
      this.seo.update({
        title: `${data.pageTitle} — Tribuna`,
        description: 'Últimas notícias e artigos da Tribuna sobre mídia, cultura e negócios.',
        path: '/blog',
      });
    });
  }
}
