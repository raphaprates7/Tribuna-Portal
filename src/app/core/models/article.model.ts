import { Breadcrumb, BlogCategory, RecentPost } from './blog.model';
import { SidebarExtra } from './content.model';

export interface ShareLink {
  icon: 'facebook' | 'whatsapp' | 'linkedin' | 'x';
  href: string;
  label: string;
}

export interface ArticleComment {
  name: string;
  date: string;
  text: string;
}

export interface ArticleDetail {
  id: number;
  breadcrumbs: Breadcrumb[];
  title: string;
  subtitle: string;
  summary: string;
  date: string;
  author: string;
  shareLinks: ShareLink[];
  heroImage: string | null;
  // HTML rico produzido pelo editor Quill no painel admin — já sanitizado
  // no servidor; renderizado via [innerHTML] (Angular sanitiza de novo).
  contentHtml: string;
  categories: BlogCategory[];
  recentPosts: RecentPost[];
  extras: SidebarExtra[];
  comments: ArticleComment[];
}
