import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private blogService: BlogService, private seo: SeoService) {}

  ngOnInit(): void {
    this.blogService.getBlogPage().subscribe((data) => {
      this.data.set(data);
      this.seo.update({
        title: `${data.pageTitle} — Tribuna`,
        description: 'Últimas notícias e artigos da Tribuna sobre mídia, cultura e negócios.',
        path: '/blog',
      });
    });
  }

  onPageChange(page: number): void {
    // TODO: once the real API paginates, refetch with the new page here
    this.data.update((d) => (d ? { ...d, pagination: { ...d.pagination, current: page } } : d));
  }
}
