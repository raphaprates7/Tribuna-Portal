import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VerticalPageService } from '../../core/services/vertical-page.service';
import { VerticalPageData } from '../../core/models/vertical.model';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { HeroFeaturedComponent } from '../home/components/hero-featured/hero-featured.component';
import { TrendingPanelComponent } from '../home/components/trending-panel/trending-panel.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { PaginationComponent } from '../blog/components/pagination/pagination.component';

@Component({
  selector: 'app-vertical-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    HeroFeaturedComponent,
    TrendingPanelComponent,
    CategoryCardComponent,
    PaginationComponent,
  ],
  templateUrl: './vertical-page.component.html',
  styleUrl: './vertical-page.component.scss',
})
export class VerticalPageComponent implements OnInit {
  data = signal<VerticalPageData | null>(null);
  private slug = '';

  constructor(
    private route: ActivatedRoute,
    private verticalService: VerticalPageService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.data['slug'];
    const pagina = Number(this.route.snapshot.queryParamMap.get('pagina')) || 1;
    this.carregar(pagina);
  }

  onPageChange(page: number): void {
    this.carregar(page);
  }

  private carregar(pagina: number): void {
    this.verticalService.getPage(this.slug, pagina).subscribe((data) => {
      this.data.set(data);
      this.seo.update({
        title: `${data.name} — Tribuna`,
        description: data.intro,
        image: data.cards.find((c) => c.image)?.image,
        path: `/${data.slug}`,
      });
    });
  }
}
