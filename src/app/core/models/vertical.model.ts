import { Breadcrumb } from './blog.model';
import { FeaturedArticle, ContentCard } from './home.model';

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
  featuredArticle: FeaturedArticle;
  cards: ContentCard[];
}
