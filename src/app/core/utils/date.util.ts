/** Formata uma data ISO (ex: "2026-08-18T13:00:20") como "dd/MM/yyyy" pt-BR. */
export function formatarDataBr(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}
