import { Breadcrumb } from './blog.model';
import { FeaturedArticle, ContentCard } from './home.model';

export interface VerticalTheme {
  accent: string;
  accentDark: string;
  accentTint: string;
  dark?: boolean;
  /** Lighter accent variant for readable text on the dark ground — only needed when dark is true. */
  accentOnDark?: string;
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
