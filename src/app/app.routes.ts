import { Routes } from '@angular/router';
import { adminGuard, adminOnlyGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    title: 'Painel Admin — Tribuna',
    children: [
      { path: '', redirectTo: 'artigos', pathMatch: 'full' },
      {
        path: 'artigos',
        loadComponent: () => import('./features/admin/artigos/artigo-list.component').then((m) => m.ArtigoListComponent),
      },
      {
        path: 'artigos/novo',
        loadComponent: () => import('./features/admin/artigos/artigo-form.component').then((m) => m.ArtigoFormComponent),
      },
      {
        path: 'artigos/:id/editar',
        loadComponent: () => import('./features/admin/artigos/artigo-form.component').then((m) => m.ArtigoFormComponent),
      },
      {
        path: 'verticais',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./features/admin/verticais/vertical-list.component').then((m) => m.VerticalListComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categorias/categoria-list.component').then((m) => m.CategoriaListComponent),
      },
      {
        path: 'comentarios',
        loadComponent: () =>
          import('./features/admin/comentarios/comentario-moderacao.component').then((m) => m.ComentarioModeracaoComponent),
      },
      {
        path: 'usuarios',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./features/admin/usuarios/usuario-list.component').then((m) => m.UsuarioListComponent),
      },
    ],
  },
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
    path: 'busca',
    loadComponent: () => import('./features/search/search-page.component').then((m) => m.SearchPageComponent),
    title: 'Busca — Tribuna',
  },
  {
    path: 'cadastre-se',
    loadComponent: () => import('./features/auth/create-account.component').then((m) => m.CreateAccountComponent),
    title: 'Criar nova conta — Tribuna',
  },
  {
    path: 'esqueci-senha',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    title: 'Esqueci minha senha — Tribuna',
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
    title: 'Redefinir senha — Tribuna',
  },
  {
    path: 'artigos/:slug',
    loadComponent: () => import('./features/article/article-page.component').then((m) => m.ArticlePageComponent),
    title: 'Artigo — Tribuna',
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./features/favoritos/favoritos.component').then((m) => m.FavoritosComponent),
    title: 'Favoritos — Tribuna',
  },
  {
    path: 'contato',
    loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contato — Tribuna',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Página não encontrada — Tribuna',
  },
];
