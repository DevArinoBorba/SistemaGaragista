import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStoreSettings } from "@/features/store/repository";
import { formatCnpj, formatPhone } from "@/features/store/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  return {
    title: `Política de Privacidade | ${store.name}`,
    description: `Política de Privacidade e proteção de dados pessoais (LGPD) da ${store.name}.`,
  };
}

export default async function PrivacyPage() {
  const store = await getStoreSettings();
  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="legal-page">
        <div className="financing-shell">
          <div className="financing-card legal-card">
            <span className="financing-eyebrow">LGPD · Privacidade</span>
            <h1>Política de Privacidade</h1>
            <p>
              A <strong>{store.name}</strong>{store.cnpj ? ` (CNPJ ${formatCnpj(store.cnpj)})` : ""} valoriza a transparência e a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>

            <h2>1. Dados coletados</h2>
            <p>
              Coletamos apenas os dados fornecidos voluntariamente por você ao solicitar atendimento ou simulação de financiamento (como nome, telefone/WhatsApp, e-mail e mensagem), além de cookies estritamente técnicos necessários ao funcionamento do site.
            </p>

            <h2>2. Finalidade do uso</h2>
            <p>
              Os dados informados são utilizados exclusivamente para responder às suas solicitações comerciais, apresentar propostas de veículos e realizar simulações de financiamento junto às instituições financeiras parceiras mediante seu pedido.
            </p>

            <h2>3. Compartilhamento e segurança</h2>
            <p>
              Não comercializamos dados pessoais. As informações somente são compartilhadas quando indispensáveis para análise de crédito solicitada pelo próprio titular ou cumprimento de obrigação legal.
            </p>

            <h2>4. Direitos do titular e contato</h2>
            <p>
              Você pode solicitar confirmação, correção ou exclusão de seus dados a qualquer momento pelos nossos canais oficiais
              {store.email ? ` (${store.email})` : ""}
              {store.whatsapp ? ` ou WhatsApp ${formatPhone(store.whatsapp)}` : ""}.
            </p>

            <div className="legal-actions">
              <Link href="/" className="button secondary">Voltar ao Início</Link>
              <Link href="/contato" className="button primary">Falar com a Loja</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter store={store} />
    </>
  );
}
