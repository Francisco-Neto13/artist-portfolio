/**
 * Filtro de periodo da galeria.
 *
 * As opcoes saem DOS DADOS, nao de uma lista fixa. O acervo hoje tem 24 obras,
 * todas de 2026, entre fevereiro e julho — uma lista fixa mostraria "Last 30
 * Days" (zero resultados) e "2026" (as 24, igual a "All Time"). Chip que sempre
 * devolve zero, ou que devolve tudo, parece defeito.
 *
 * Entao: uma faixa so aparece se tiver obra dentro dela, se nao pegar o acervo
 * inteiro (seria "All Time" com outro nome) e se nao repetir a contagem da
 * faixa anterior (nao acrescenta informacao).
 */

export type PeriodKey = 'all' | 'd30' | 'm6' | 'm12' | `y${number}`;

export type PeriodOption = {
  key: PeriodKey;
  label: string;
  count: number;
};

export const PERIODO_PADRAO: PeriodKey = 'all';

/**
 * Meia-noite UTC do dia de `agora`.
 *
 * A pagina e ISR (revalida a cada 60s), entao o HTML vem do servidor e hidrata
 * no cliente com um relogio diferente. Ancorar no DIA faz os dois concordarem;
 * sem isso, uma obra exatamente no limite de 30 dias poderia contar de um lado
 * e nao do outro, e a hidratacao acusaria divergencia.
 */
function inicioDoDia(agora: Date): number {
  return Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
}

function limiteEmDias(agora: Date, dias: number): number {
  return inicioDoDia(agora) - dias * 24 * 60 * 60 * 1000;
}

function limiteEmMeses(agora: Date, meses: number): number {
  const d = new Date(inicioDoDia(agora));
  d.setUTCMonth(d.getUTCMonth() - meses);
  return d.getTime();
}

/** Faixas relativas, da mais curta para a mais longa. A ordem importa no corte. */
const FAIXAS: { key: PeriodKey; label: string; desde: (agora: Date) => number }[] = [
  { key: 'd30', label: 'Last 30 Days', desde: (a) => limiteEmDias(a, 30) },
  { key: 'm6', label: 'Last 6 Months', desde: (a) => limiteEmMeses(a, 6) },
  { key: 'm12', label: 'Last 12 Months', desde: (a) => limiteEmMeses(a, 12) },
];

function comoData(valor: string | null | undefined): number | null {
  if (!valor) return null;
  const t = new Date(valor).getTime();
  return Number.isNaN(t) ? null : t;
}

export function matchesPeriod(
  createdAt: string | null | undefined,
  key: PeriodKey,
  agora: Date = new Date(),
): boolean {
  if (key === 'all') return true;

  const t = comoData(createdAt);
  // Obra sem data valida some de qualquer recorte que nao seja "All Time" — nao
  // da para afirmar que ela pertence a um periodo.
  if (t === null) return false;

  if (key.startsWith('y')) {
    const ano = Number(key.slice(1));
    return new Date(t).getUTCFullYear() === ano;
  }

  const faixa = FAIXAS.find((f) => f.key === key);
  return faixa ? t >= faixa.desde(agora) : true;
}

export function buildPeriodOptions(
  datas: (string | null | undefined)[],
  agora: Date = new Date(),
): PeriodOption[] {
  const total = datas.length;
  const opcoes: PeriodOption[] = [{ key: 'all', label: 'All Time', count: total }];

  if (total === 0) return opcoes;

  let contagemAnterior: number | null = null;

  for (const faixa of FAIXAS) {
    const count = datas.filter((d) => matchesPeriod(d, faixa.key, agora)).length;
    // Vazia, igual ao acervo inteiro, ou repetindo a faixa anterior: nao entra.
    if (count === 0 || count === total || count === contagemAnterior) continue;

    opcoes.push({ key: faixa.key, label: faixa.label, count });
    contagemAnterior = count;
  }

  // Anos so quando ha mais de um: com o acervo inteiro num ano so, o chip do ano
  // seria "All Time" de novo.
  const anos = new Map<number, number>();
  for (const d of datas) {
    const t = comoData(d);
    if (t === null) continue;
    const ano = new Date(t).getUTCFullYear();
    anos.set(ano, (anos.get(ano) ?? 0) + 1);
  }

  if (anos.size > 1) {
    for (const [ano, count] of [...anos.entries()].sort((a, b) => b[0] - a[0])) {
      opcoes.push({ key: `y${ano}`, label: String(ano), count });
    }
  }

  return opcoes;
}
