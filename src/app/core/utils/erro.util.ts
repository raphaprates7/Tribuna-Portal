import { HttpErrorResponse } from '@angular/common/http';

/**
 * O backend devolve erro em três formatos diferentes dependendo de onde ele
 * é gerado: `{ mensagem }` (erros de negócio), lista de strings (erros do
 * ASP.NET Identity, ex: regras de senha) ou `{ errors: { Campo: [...] } }`
 * (validação automática de DataAnnotations). Esta função normaliza os três.
 */
export function extrairMensagemErro(erro: HttpErrorResponse, fallback: string): string {
  const corpo = erro.error;

  if (Array.isArray(corpo)) {
    return corpo.join(' ');
  }

  if (corpo?.errors && typeof corpo.errors === 'object') {
    const mensagens = Object.values(corpo.errors as Record<string, string[]>).flat();
    if (mensagens.length) {
      return mensagens.join(' ');
    }
  }

  return corpo?.mensagem ?? fallback;
}
