import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tribunaco',
    loadComponent: () => import('./features/hub/hub-page.component').then((m) => m.HubPageComponent),
    title: 'Tribuna&Co. — Todas as Verticais',
  },
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Tribuna — Mídia. Cultura. Negócios.',
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog.component').then((m) => m.BlogComponent),
    title: 'Últimas Notícias — Tribuna',
  },
  {
    path: 'quem-somos',
    loadComponent: () =>
      import('./features/institutional/institutional-page.component').then((m) => m.InstitutionalPageComponent),
    data: { slug: 'quem-somos' },
    title: 'Quem Somos — Tribuna',
  },
  {
    path: 'sobre-o-portal',
    loadComponent: () =>
      import('./features/institutional/institutional-page.component').then((m) => m.InstitutionalPageComponent),
    data: { slug: 'sobre-o-portal' },
    title: 'Sobre o Portal — Tribuna',
  },
  {
    path: 'linha-editorial',
    loadComponent: () =>
      import('./features/institutional/institutional-page.component').then((m) => m.InstitutionalPageComponent),
    data: { slug: 'linha-editorial' },
    title: 'Linha Editorial — Tribuna',
  },
  {
    path: 'capital',
    loadComponent: () => import('./features/vertical/vertical-page.component').then((m) => m.VerticalPageComponent),
    data: { slug: 'capital' },
    title: 'Tribuna Capital — Tribuna',
  },
  {
    path: 'esportes',
    loadComponent: () => import('./features/vertical/vertical-page.component').then((m) => m.VerticalPageComponent),
    data: { slug: 'esportes' },
    title: 'Tribuna Esportes — Tribuna',
  },
  {
    path: 'tech',
    loadComponent: () => import('./features/vertical/vertical-page.component').then((m) => m.VerticalPageComponent),
    data: { slug: 'tech' },
    title: 'Tribuna Tech — Tribuna',
  },
  {
    path: 'gg',
    loadComponent: () => import('./features/vertical/vertical-page.component').then((m) => m.VerticalPageComponent),
    data: { slug: 'gg' },
    title: 'Tribuna GG — Tribuna',
  },
  {
    path: 'termos-de-uso',
    loadComponent: () =>
      import('./features/institutional/institutional-page.component').then((m) => m.InstitutionalPageComponent),
    data: { slug: 'termos-de-uso' },
    title: 'Termos de Uso — Tribuna',
  },
  {
    path: 'politica-de-privacidade',
    loadComponent: () =>
      import('./features/institutional/institutional-page.component').then((m) => m.InstitutionalPageComponent),
    data: { slug: 'politica-de-privacidade' },
    title: 'Política de Privacidade — Tribuna',
  },
  {
    path: 'cadastre-se',
    loadComponent: () => import('./features/auth/create-account.component').then((m) => m.CreateAccountComponent),
    title: 'Criar nova conta — Tribuna',
  },
  {
    path: 'artigos/:slug',
    loadComponent: () => import('./features/article/article-page.component').then((m) => m.ArticlePageComponent),
    title: 'Artigo — Tribuna',
  },
  {
    path: 'contato',
    loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contato — Tribuna',
  },
  { path: '**', redirectTo: '' },
];
