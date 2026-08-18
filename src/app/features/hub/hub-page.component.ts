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

interface HubRailItem {
  title: string;
  excerpt: string;
  href: string;
  image: string | null;
}

interface HubRail {
  slug: string;
  name: string;
  accent: string;
  href: string;
  items: HubRailItem[];
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
    const destaque = v.featuredArticles.map((a) => ({
      title: a.title,
      excerpt: a.excerpt,
      href: a.href,
      image: a.image,
    }));

    const cards = v.cards.map((c) => ({
      title: c.title,
      excerpt: c.excerpt,
      href: c.href,
      image: c.image,
    }));

    return {
      slug: v.slug,
      name: v.name,
      accent: v.theme.accent,
      href: `/${v.slug}`,
      items: [...destaque, ...cards].slice(0, 4),
    };
  }
}
