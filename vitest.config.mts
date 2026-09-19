import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      // `server-only` so existe dentro do bundler do Next: e um marcador que
      // quebra o build se um modulo de servidor for importado pelo client.
      // Fora do Next ele nao resolve, entao aqui vira um modulo vazio — o que
      // permite testar `lib/admin/server.ts`, o portao do dashboard, direto.
      'server-only': path.resolve(import.meta.dirname, 'src/test/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
});
