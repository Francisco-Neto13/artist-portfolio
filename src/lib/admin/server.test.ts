import { describe, expect, it, vi } from 'vitest';
import { getIsAdminUser } from '@/lib/admin/server';

/**
 * `is_admin()` e o unico portao do dashboard. O que este teste protege e o
 * comportamento em caso de duvida: qualquer resposta que nao seja um `true`
 * explicito do banco tem de virar "nao e admin".
 */

function clienteQueResponde(resposta: { data: boolean | null; error: { message?: string } | null }) {
  const single = vi.fn().mockResolvedValue(resposta);
  const rpc = vi.fn(() => ({ single }));
  return { cliente: { rpc }, rpc, single };
}

describe('getIsAdminUser', () => {
  it('e admin quando o banco responde true', async () => {
    const { cliente } = clienteQueResponde({ data: true, error: null });
    await expect(getIsAdminUser(cliente, 'user-1')).resolves.toBe(true);
  });

  it('nao e admin quando o banco responde false', async () => {
    const { cliente } = clienteQueResponde({ data: false, error: null });
    await expect(getIsAdminUser(cliente, 'user-1')).resolves.toBe(false);
  });

  it('nao chama o banco sem usuario', async () => {
    const { cliente, rpc } = clienteQueResponde({ data: true, error: null });
    await expect(getIsAdminUser(cliente, undefined)).resolves.toBe(false);
    await expect(getIsAdminUser(cliente, null)).resolves.toBe(false);
    await expect(getIsAdminUser(cliente, '')).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('nao e admin quando o RPC devolve erro', async () => {
    const aviso = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { cliente } = clienteQueResponde({ data: null, error: { message: 'permission denied' } });
    await expect(getIsAdminUser(cliente, 'user-1')).resolves.toBe(false);
    expect(aviso).toHaveBeenCalled();
    aviso.mockRestore();
  });

  it('nao e admin quando o banco devolve null', async () => {
    const { cliente } = clienteQueResponde({ data: null, error: null });
    await expect(getIsAdminUser(cliente, 'user-1')).resolves.toBe(false);
  });
});
