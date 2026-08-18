import { Breadcrumb } from './blog.model';
import { FeaturedArticle, ContentCard, TrendingItem } from './home.model';

export interface VerticalTheme {
  accent: string;
  accentDark: string;
  accentTint: string;
  dark?: boolean;
}

export interface VerticalPageData {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  theme: VerticalTheme;
  breadcrumbs: Breadcrumb[];
  featuredArticles: FeaturedArticle[];
  trending: TrendingItem[];
  cards: ContentCard[];
}
