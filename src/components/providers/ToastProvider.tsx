'use client';

/**
 * Toasts do site inteiro, num container so.
 *
 * Antes havia dois sistemas paralelos: o `MetadataToasts` (com estilo de
 * success/error/warning) e uma copia menor, inline dentro do CommissionSection,
 * que so conhecia success e warning. Cada um com seu `pushToast` e seu estado.
 *
 * O motivo de virar provider e outro, porem: a maior parte dos erros do admin
 * nao chegava a lugar nenhum. Upload que falha, delete que falha, perfil que
 * nao salva — tudo terminava num `console.error`, e a tela so parava de girar.
 * Com o provider no root, qualquer componente avisa o usuario sem precisar
 * montar container proprio.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

type Toast = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  /** Mostra um toast. Some sozinho; `error` fica mais tempo, porque tem de ser lido. */
  pushToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURACAO_MS: Record<ToastType, number> = {
  success: 3_500,
  warning: 3_500,
  error: 6_000,
};

const estilos: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

function ToastIcon({ type }: { type: ToastType }) {
  const d =
    type === 'success'
      ? 'M5 13l4 4L19 7'
      : type === 'error'
        ? 'M6 18L18 6M6 6l12 12'
        : 'M12 9v4m0 4h.01';

  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // `Date.now()` como id colidia quando dois toasts saiam no mesmo milissegundo
  // (um delete que dispara erro e aviso junto), e o React reclamava da key.
  const proximoId = useRef(0);

  const pushToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = proximoId.current++;
    setToasts((anteriores) => [...anteriores, { id, message, type }]);
    setTimeout(() => setToasts((anteriores) => anteriores.filter((t) => t.id !== id)), DURACAO_MS[type]);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live: quem usa leitor de tela tambem precisa saber que o upload falhou. */}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-sm"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[11px] font-medium tracking-wide shadow-xl animate-in slide-in-from-bottom-2 duration-300 ${estilos[toast.type]}`}
          >
            <ToastIcon type={toast.type} />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

/** Mensagem legivel de um erro desconhecido, para nao imprimir `[object Object]`. */
export function mensagemDeErro(err: unknown, padrao: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  return padrao;
}
