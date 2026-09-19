import type { Metadata } from 'next';
import Hero from '@/components/hero/Hero';
import Gallery from '@/components/gallery/Gallery';
import CommissionSection from '@/components/commissions/CommissionSection';
import { carregarDadosIniciais } from '@/lib/serverData';

/**
 * ISR: a pagina continua estatica, regerada no maximo uma vez por minuto.
 *
 * O admin que acabou de salvar ve a mudanca na hora, porque o proprio painel
 * atualiza o estado local. Para os visitantes ela aparece na proxima
 * regeneracao — ate um minuto. Para um portfolio que muda algumas vezes por
 * mes, e uma troca boa: o HTML sai do cache, com o conteudo certo dentro.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await carregarDadosIniciais();

  // O nome vive no banco; o title era o literal "Atmisuki" no layout, que
  // continua valendo como reserva quando o Supabase nao responde.
  const nome = profile?.full_name?.trim();
  if (!nome) return {};

  return {
    title: `${nome} | Digital Artist Portfolio`,
    description: profile?.bio?.trim() || undefined,
  };
}

export default async function Home() {
  const { profile, artworks, categories, types, tiers } = await carregarDadosIniciais();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="animate-reveal">
        <Hero initialProfile={profile} />
      </div>
      <section className="pb-12 md:pb-24 border-t border-blue-900/20 pt-10 md:pt-16">
        <Gallery
          initialArtworks={artworks}
          initialCategories={categories}
          initialTypes={types}
        />
      </section>
      <section className="border-t border-blue-900/20">
        <CommissionSection initialTiers={tiers} initialProfile={profile} />
      </section>
    </div>
  );
}
