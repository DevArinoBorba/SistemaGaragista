import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStoreSettings } from "@/features/store/repository";
import { formatCnpj } from "@/features/store/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  return {
    title: `Termos de Uso | ${store.name}`,
    description: `Termos e condições de uso do catálogo online da ${store.name}.`,
  };
}

export default async function TermsPage() {
  const store = await getStoreSettings();
  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="legal-page">
        <div className="financing-shell">
          <div className="financing-card legal-card">
            <span className="financing-eyebrow">Condições Gerais</span>
            <h1>Termos de Uso</h1>
            <p>
              Bem-vindo ao catálogo digital da <strong>{store.name}</strong>{store.cnpj ? ` (CNPJ ${formatCnpj(store.cnpj)})` : ""}. Ao navegar neste site, você concorda com as condições descritas abaixo.
            </p>

            <h2>1. Informações do catálogo</h2>
            <p>
              As fotos, especificações, quilometragem e valores exibidos nos anúncios têm caráter informativo e referem-se aos veículos disponíveis no estoque da loja, estando sujeitos a confirmação de disponibilidade e eventuais atualizações sem aviso prévio.
            </p>

            <h2>2. Simulações de financiamento</h2>
            <p>
              As solicitações de financiamento encaminhadas pelo site estão sujeitas à análise e aprovação de crédito pelas instituições financeiras parceiras, podendo variar conforme perfil e condições vigentes.
            </p>

            <h2>3. Propriedade intelectual</h2>
            <p>
              A marca, o logotipo, as fotografias e o conteúdo deste site pertencem à {store.name}, sendo vedada sua reprodução comercial desautorizada.
            </p>

            <div className="legal-actions">
              <Link href="/" className="button secondary">Voltar ao Início</Link>
              <Link href="/contato" className="button primary">Entrar em Contato</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter store={store} />
    </>
  );
}
