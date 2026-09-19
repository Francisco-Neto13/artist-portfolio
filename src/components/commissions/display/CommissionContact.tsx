import { Mail, Lock } from 'lucide-react';
import { InstagramIcon, XIcon } from '@/components/shared/BrandIcons';
import { safeMailto, safeSocialUrl } from '@/lib/safeLinks';
import type { CommissionStatus } from '../types';

interface Props {
  socialLinks: { instagram: string; twitter: string; mail: string } | null;
  status: CommissionStatus;
}

/**
 * A area de contato segue o status das commissions.
 *
 * Antes ela convidava a "start your commission" mesmo com tudo fechado, o que
 * gera pedido que vai ser recusado — trabalho para os dois lados.
 *
 *   open     -> convite normal
 *   waitlist -> convite mantido, mas dizendo que entra na fila. Fila fechada
 *               para contato nao e fila, e sim o mesmo que fechado.
 *   closed   -> nenhum link. Os <a> sao REMOVIDOS, nao apenas apagados: um
 *               link desabilitado no visual continua alcancavel pelo teclado e
 *               pelo leitor de tela.
 */
const COPIA: Record<CommissionStatus, { etiqueta: string; titulo: string }> = {
  open: {
    etiqueta: 'Get in Touch',
    titulo: 'Ready to start your commission?',
  },
  waitlist: {
    etiqueta: 'Waitlist Open',
    titulo: 'Want a spot on the waitlist?',
  },
  closed: {
    etiqueta: 'Commissions Closed',
    titulo: 'Not taking new commissions right now',
  },
};

export default function CommissionContact({ socialLinks, status }: Props) {
  const aberto = status !== 'closed';

  const instagramUrl = aberto ? safeSocialUrl(socialLinks?.instagram) : null;
  const twitterUrl = aberto ? safeSocialUrl(socialLinks?.twitter) : null;
  const mailtoUrl = aberto ? safeMailto(socialLinks?.mail) : null;

  const { etiqueta, titulo } = COPIA[status];

  return (
    <div className="mt-20 md:mt-32 text-center max-w-2xl mx-auto">
      <div className="inline-block mb-8 md:mb-10">
        <p
          className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] mb-3 md:mb-4 ${
            aberto ? 'text-blue-500' : 'text-slate-600'
          }`}
        >
          {etiqueta}
        </p>
        <h3
          className={`text-lg md:text-2xl font-bold tracking-tight ${
            aberto ? 'text-white' : 'text-slate-500'
          }`}
        >
          {titulo}
        </h3>
        <div
          className={`h-px mt-4 md:mt-6 bg-gradient-to-r from-transparent to-transparent ${
            aberto ? 'via-blue-500/40' : 'via-white/10'
          }`}
        />
      </div>

      {aberto ? (
        <>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 bg-white/[0.03] border border-white/10 hover:border-pink-500/40 hover:bg-pink-500/5 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer group"
              >
                <InstagramIcon size={15} className="text-slate-500 group-hover:text-pink-500 transition-colors" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Instagram</span>
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 bg-white/[0.03] border border-white/10 hover:border-blue-400/40 hover:bg-blue-400/5 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer group"
              >
                <XIcon size={15} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Twitter / X</span>
              </a>
            )}
            {mailtoUrl && (
              <a href={mailtoUrl}
                className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 group"
              >
                <Mail size={15} className="group-hover:scale-110 transition-transform" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Send Email</span>
              </a>
            )}
          </div>

          <p className="text-[8px] md:text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-8 md:mt-10">
            {status === 'waitlist'
              ? 'Spots open as slots free up'
              : 'Typically responds within 24-48 hours'}
          </p>
        </>
      ) : (
        /* Nada clicavel aqui: nem link, nem botao, nem campo. */
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-slate-600">
            <Lock size={14} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Contact unavailable</span>
          </div>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em] md:tracking-[0.3em] max-w-xs">
            Follow along on social media to hear when they reopen
          </p>
        </div>
      )}
    </div>
  );
}
