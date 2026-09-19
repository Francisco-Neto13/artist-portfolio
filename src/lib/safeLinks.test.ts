import { describe, expect, it } from 'vitest';
import { safeMailto, safeSocialUrl } from '@/lib/safeLinks';

/**
 * Estas duas funcoes sao a unica barreira entre o campo de texto do painel de
 * admin e um `href` renderizado. O valor vem do banco, entao o teste que
 * importa aqui e o do link hostil.
 */

describe('safeSocialUrl', () => {
  it('deixa passar http e https', () => {
    expect(safeSocialUrl('https://instagram.com/atmisuki')).toBe('https://instagram.com/atmisuki');
    expect(safeSocialUrl('http://exemplo.com/')).toBe('http://exemplo.com/');
  });

  it('corta espacos em volta', () => {
    expect(safeSocialUrl('  https://x.com/atmisuki  ')).toBe('https://x.com/atmisuki');
  });

  it('recusa javascript:, data: e outros esquemas', () => {
    expect(safeSocialUrl('javascript:alert(1)')).toBeNull();
    expect(safeSocialUrl('JavaScript:alert(1)')).toBeNull();
    expect(safeSocialUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeSocialUrl('vbscript:msgbox(1)')).toBeNull();
    expect(safeSocialUrl('file:///etc/passwd')).toBeNull();
  });

  it('recusa vazio, nulo e o placeholder "#" do seed', () => {
    expect(safeSocialUrl('#')).toBeNull();
    expect(safeSocialUrl('')).toBeNull();
    expect(safeSocialUrl('   ')).toBeNull();
    expect(safeSocialUrl(null)).toBeNull();
    expect(safeSocialUrl(undefined)).toBeNull();
  });

  it('recusa url relativa, que nao e link de rede social', () => {
    expect(safeSocialUrl('/dashboard')).toBeNull();
    expect(safeSocialUrl('instagram.com/atmisuki')).toBeNull();
  });
});

describe('safeMailto', () => {
  it('monta o mailto a partir do email', () => {
    expect(safeMailto('oi@atmisuki.com')).toBe('mailto:oi@atmisuki.com');
  });

  it('aceita o valor ja com mailto:, sem duplicar o prefixo', () => {
    expect(safeMailto('mailto:oi@atmisuki.com')).toBe('mailto:oi@atmisuki.com');
    expect(safeMailto('MAILTO:oi@atmisuki.com')).toBe('mailto:oi@atmisuki.com');
  });

  it('recusa o que nao tem cara de email', () => {
    expect(safeMailto('atmisuki')).toBeNull();
    expect(safeMailto('a@b')).toBeNull();
    expect(safeMailto('a b@c.com')).toBeNull();
    expect(safeMailto('#')).toBeNull();
    expect(safeMailto('')).toBeNull();
    expect(safeMailto(null)).toBeNull();
  });

  it('recusa javascript: disfarcado de mailto', () => {
    expect(safeMailto('javascript:alert(1)')).toBeNull();
    expect(safeMailto('mailto:javascript:alert(1)')).toBeNull();
  });
});
