import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { VerticalPageService } from '../../core/services/vertical-page.service';
import { VerticalPageData } from '../../core/models/vertical.model';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { HeroFeaturedComponent } from '../home/components/hero-featured/hero-featured.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';

@Component({
  selector: 'app-vertical-page',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, HeroFeaturedComponent, CategoryCardComponent],
  templateUrl: './vertical-page.component.html',
  styleUrl: './vertical-page.component.scss',
})
export class VerticalPageComponent implements OnInit {
  data = signal<VerticalPageData | null>(null);

  constructor(
    private route: ActivatedRoute,
    private verticalService: VerticalPageService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(switchMap((routeData) => this.verticalService.getPage(routeData['slug'])))
      .subscribe((data) => {
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
