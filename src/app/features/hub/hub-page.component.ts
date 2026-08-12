import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HomeService } from '../../core/services/home.service';
import { VerticalPageService } from '../../core/services/vertical-page.service';
import { HomePageData } from '../../core/models/home.model';
import { VerticalPageData } from '../../core/models/vertical.model';
import { HeroFeaturedComponent } from '../home/components/hero-featured/hero-featured.component';
import { NewsletterFormComponent } from '../../shared/components/newsletter-form/newsletter-form.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SeoService } from '../../core/services/seo.service';

interface HubHeadline {
  title: string;
  href: string;
}

interface HubRail {
  slug: string;
  name: string;
  accent: string;
  href: string;
  image: string | null;
  headlines: HubHeadline[];
}

@Component({
  selector: 'app-hub-page',
  standalone: true,
  imports: [CommonModule, HeroFeaturedComponent, NewsletterFormComponent, IconComponent],
  templateUrl: './hub-page.component.html',
  styleUrl: './hub-page.component.scss',
})
export class HubPageComponent implements OnInit {
  home = signal<HomePageData | null>(null);
  rails = signal<HubRail[]>([]);

  constructor(
    private homeService: HomeService,
    private verticalService: VerticalPageService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Tribuna&Co. — Todas as Verticais',
      description: 'Mídia, negócios, esportes, tecnologia e games — o melhor de cada frente da Tribuna&Co., reunido em um só lugar.',
      path: '/tribunaco',
    });

    this.homeService.getHomePage().subscribe((data) => this.home.set(data));

    forkJoin({
      capital: this.verticalService.getPage('capital'),
      esportes: this.verticalService.getPage('esportes'),
      tech: this.verticalService.getPage('tech'),
      gg: this.verticalService.getPage('gg'),
    }).subscribe((verticals) => {
      this.rails.set(Object.values(verticals).map((v) => this.toRail(v)));
    });
  }

  private toRail(v: VerticalPageData): HubRail {
    const headlines: HubHeadline[] = [
      { title: v.featuredArticle.title, href: v.featuredArticle.href },
      ...v.cards.map((c) => ({ title: c.title, href: c.href })),
    ].slice(0, 5);

    return {
      slug: v.slug,
      name: v.name,
      accent: v.theme.accent,
      href: `/${v.slug}`,
      image: v.cards.find((c) => c.image)?.image ?? null,
      headlines,
    };
  }
}
