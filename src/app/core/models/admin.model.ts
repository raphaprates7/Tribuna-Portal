export interface PaginaResult<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
}

export interface ArtigoAdmin {
  id: number;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  resumo: string;
  conteudoHtml: string;
  imagemCapaUrl: string | null;
  patrocinado: boolean;
  destaque: boolean;
  publicada: boolean;
  criadoEm: string;
  atualizadoEm: string | null;
  publicadoEm: string | null;
  visualizacoes: number;
  verticalId: number;
  verticalNome: string;
  categoriaId: number | null;
  categoriaNome: string | null;
  autorId: string;
  autorNome: string;
  autorExibicao: string | null;
}

export interface ArtigoFormValue {
  titulo: string;
  subtitulo: string | null;
  resumo: string;
  conteudoHtml: string;
  imagemCapaUrl: string | null;
  patrocinado: boolean;
  destaque: boolean;
  publicada: boolean;
  verticalId: number;
  categoriaId: number | null;
  autorExibicao: string | null;
}

// Seção do site (Capital, Esportes, Tech, Games...) — define em qual página o
// artigo aparece.
export interface VerticalAdmin {
  id: number;
  nome: string;
  slug: string;
  tagline: string | null;
  descricao: string | null;
  icone: string | null;
  corAccent: string | null;
  corAccentDark: string | null;
  corAccentTint: string | null;
  temaEscuro: boolean;
  ordem: number;
  quantidadeArtigos: number;
}

export interface VerticalFormValue {
  nome: string;
  slug: string;
  tagline?: string | null;
  descricao?: string | null;
  icone?: string | null;
  corAccent?: string | null;
  corAccentDark?: string | null;
  corAccentTint?: string | null;
  temaEscuro: boolean;
  ordem: number;
}

// Tema/tag livre pra filtrar dentro do blog — independente de vertical.
export interface CategoriaAdmin {
  id: number;
  nome: string;
  slug: string;
  quantidadeArtigos: number;
}

export interface CategoriaFormValue {
  nome: string;
  slug: string;
}

export interface ComentarioModeracao {
  id: number;
  nome: string;
  email: string;
  texto: string;
  criadoEm: string;
  aprovado: boolean;
  artigoId: number;
  artigoTitulo: string;
}

export interface UsuarioAdmin {
  id: string;
  nomeCompleto: string;
  email: string;
  ativo: boolean;
  roles: string[];
}

export interface CriarUsuarioForm {
  nomeCompleto: string;
  email: string;
  senha: string;
  role: 'Admin' | 'Editor';
}
