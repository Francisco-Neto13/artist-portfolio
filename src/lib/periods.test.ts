import { describe, expect, it } from 'vitest';
import { buildPeriodOptions, matchesPeriod } from '@/lib/periods';

const AGORA = new Date('2026-09-19T10:30:00Z');
const d = (iso: string) => `${iso}T12:00:00.000Z`;

/** O acervo real quando o filtro foi escrito: 24 obras, todas de 2026. */
const ACERVO = [
  ...Array(6).fill(d('2026-02-18')),
  ...Array(4).fill(d('2026-04-10')),
  ...Array(11).fill(d('2026-06-05')),
  ...Array(3).fill(d('2026-07-25')),
];

describe('matchesPeriod', () => {
  it('"all" aceita qualquer coisa, inclusive data invalida', () => {
    expect(matchesPeriod(d('2019-01-01'), 'all', AGORA)).toBe(true);
    expect(matchesPeriod(null, 'all', AGORA)).toBe(true);
    expect(matchesPeriod('nao e data', 'all', AGORA)).toBe(true);
  });

  it('corta pelas faixas relativas', () => {
    expect(matchesPeriod(d('2026-09-10'), 'd30', AGORA)).toBe(true);
    expect(matchesPeriod(d('2026-07-25'), 'd30', AGORA)).toBe(false);
    expect(matchesPeriod(d('2026-07-25'), 'm6', AGORA)).toBe(true);
    expect(matchesPeriod(d('2026-02-18'), 'm6', AGORA)).toBe(false);
    expect(matchesPeriod(d('2026-02-18'), 'm12', AGORA)).toBe(true);
    expect(matchesPeriod(d('2025-01-01'), 'm12', AGORA)).toBe(false);
  });

  it('corta por ano', () => {
    expect(matchesPeriod(d('2026-03-01'), 'y2026', AGORA)).toBe(true);
    expect(matchesPeriod(d('2025-12-31'), 'y2026', AGORA)).toBe(false);
  });

  it('obra sem data valida some de qualquer recorte que nao seja "all"', () => {
    for (const k of ['d30', 'm6', 'm12', 'y2026'] as const) {
      expect(matchesPeriod(null, k, AGORA)).toBe(false);
      expect(matchesPeriod('', k, AGORA)).toBe(false);
      expect(matchesPeriod('nao e data', k, AGORA)).toBe(false);
    }
  });
});

describe('buildPeriodOptions', () => {
  it('nao oferece faixa vazia nem faixa igual ao acervo inteiro', () => {
    const opcoes = buildPeriodOptions(ACERVO, AGORA);
    const chaves = opcoes.map((o) => o.key);

    expect(chaves).toContain('all');
    // 'd30' pegaria zero obras (a mais nova e de 25/07).
    expect(chaves).not.toContain('d30');
    // 'm12' pegaria as 24 — seria "All Time" com outro nome.
    expect(chaves).not.toContain('m12');
    // 'm6' pega 18 das 24: acrescenta informacao, entra.
    expect(chaves).toContain('m6');
    expect(opcoes.find((o) => o.key === 'm6')?.count).toBe(18);
  });

  it('nao oferece ano quando o acervo inteiro esta num ano so', () => {
    expect(buildPeriodOptions(ACERVO, AGORA).some((o) => o.key.startsWith('y'))).toBe(false);
  });

  it('oferece os anos, do mais novo para o mais antigo, quando ha mais de um', () => {
    const anos = buildPeriodOptions([d('2024-05-01'), d('2026-01-01'), d('2025-03-03')], AGORA)
      .filter((o) => o.key.startsWith('y'));
    expect(anos.map((o) => o.key)).toEqual(['y2026', 'y2025', 'y2024']);
    expect(anos.every((o) => o.count === 1)).toBe(true);
  });

  it('nao repete faixas com a mesma contagem', () => {
    // Tudo no mesmo dia: d30 = m6 = m12 = total, nenhuma acrescenta nada.
    const opcoes = buildPeriodOptions(Array(5).fill(d('2026-09-18')), AGORA);
    expect(opcoes.map((o) => o.key)).toEqual(['all']);
  });

  it('acervo vazio devolve so "All Time"', () => {
    const opcoes = buildPeriodOptions([], AGORA);
    expect(opcoes).toHaveLength(1);
    expect(opcoes[0]).toMatchObject({ key: 'all', count: 0 });
  });

  it('a contagem de "all" e o total, incluindo data invalida', () => {
    expect(buildPeriodOptions([d('2026-06-01'), null, 'lixo'], AGORA)[0].count).toBe(3);
  });
});
