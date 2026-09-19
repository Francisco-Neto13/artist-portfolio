import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Saida do build da CI local (ver distDir no next.config.ts). Sem esta
    // linha o eslint lintava o bundle gerado: 7084 problemas de codigo que
    // ninguem escreveu.
    ".next-ci/**",
  ]),
]);

export default eslintConfig;
