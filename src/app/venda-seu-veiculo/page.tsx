import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckIcon,
  ClockIcon,
  FileCheckIcon,
  PercentIcon,
  ShieldIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { SellVehicleForm } from "@/components/sell-vehicle-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStoreSettings } from "@/features/store/repository";
import { buildWhatsAppUrl } from "@/features/store/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  return {
    title: `Venda seu Veículo | ${store.name}`,
    description: `Venda, troque ou consigne seu veículo na ${store.name} com avaliação justa, pagamento rápido e segurança total.`,
  };
}

const pillars = [
  {
    icon: <PercentIcon />,
    title: "Avaliação Justa",
    description: "Cotação transparente alinhada à Tabela FIPE e ao mercado",
  },
  {
    icon: <ClockIcon />,
    title: "Pagamento à Vista",
    description: "Liquidez imediata com transferência rápida e segura",
  },
  {
    icon: <FileCheckIcon />,
    title: "Troca com Troco",
    description: "Seu usado entra como parte do pagamento em outro veículo",
  },
  {
    icon: <ShieldIcon />,
    title: "Zero Dor de Cabeça",
    description: "Segurança contra golpes e assessoria documental completa",
  },
];

const advantages = [
  "Compra imediata com pagamento à vista garantido",
  "Avaliação profissional baseada na FIPE e mercado",
  "Opção de consignação com fotos de estúdio e vitrine",
  "Quitação de saldo devedor de financiamento na hora",
  "Segurança total: sem visitas de desconhecidos",
  "Aceitamos seu carro como entrada na troca",
  "Assessoria completa na transferência junto ao Detran",
  "Atendimento ágil pelo WhatsApp ou presencial",
];

const steps = [
  {
    number: "01",
    title: "Envie os Dados do Carro",
    description: "Preencha modelo, ano, quilometragem e seu objetivo de negócio.",
  },
  {
    number: "02",
    title: "Pré-Avaliação de Mercado",
    description: "Nossa equipe analisa a versão e o histórico com base na FIPE e Webmotors.",
  },
  {
    number: "03",
    title: "Vistoria na Loja",
    description: "Agendamos uma avaliação física rápida e transparente em nossa unidade.",
  },
  {
    number: "04",
    title: "Proposta e Pagamento",
    description: "Aprovada a proposta, cuidamos da documentação e efetuamos o pagamento.",
  },
];

export default async function SellVehiclePage() {
  const store = await getStoreSettings();
  const specialistUrl = store.whatsapp
    ? buildWhatsAppUrl(store.whatsapp, "avaliação para venda do meu veículo")
    : "/contato";

  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="financing-page">
        <section className="financing-hero" aria-labelledby="sell-title">
          <div className="financing-shell">
            <span className="financing-eyebrow">Venda seu Veículo</span>
            <h1 id="sell-title">Venda ou Troque Seu Carro com Segurança</h1>
            <p className="financing-lead">
              Receba uma proposta justa pelo seu veículo sem burocracia e sem riscos. Compramos à vista, aceitamos na troca ou vendemos em consignação.
            </p>

            <div className="financing-pillars">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="financing-pillar-card">
                  <span className="financing-pillar-icon">{pillar.icon}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="financing-main-section" aria-labelledby="evaluation-title">
          <div className="financing-shell">
            <div className="financing-section-head">
              <h2 id="evaluation-title">Solicite a Avaliação do Seu Veículo</h2>
              <p>Informe os dados do seu carro abaixo e nossos avaliadores retornarão rapidamente com uma proposta.</p>
            </div>

            <div className="financing-grid">
              <SellVehicleForm
                storeName={store.name}
                whatsapp={store.whatsapp}
                phone={store.phone}
              />

              <div className="financing-side">
                <article className="financing-card">
                  <h3>Por Que Negociar na {store.name}?</h3>
                  <ul className="financing-advantages">
                    {advantages.map((item) => (
                      <li key={item}>
                        <span className="financing-check">
                          <CheckIcon />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="financing-card">
                  <h3>Como Funciona a Avaliação</h3>
                  <ol className="financing-steps">
                    {steps.map((step) => (
                      <li key={step.number}>
                        <span className="financing-step-num">{step.number}</span>
                        <div>
                          <h4>{step.title}</h4>
                          <p>{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="financing-cta-section" aria-labelledby="sell-cta-title">
          <div className="financing-shell">
            <div className="financing-cta-box">
              <h2 id="sell-cta-title">Quer Enviar Fotos do Seu Carro Agora?</h2>
              <p>Chame nossa equipe de avaliação no WhatsApp e envie fotos e dados do seu veículo diretamente pelo celular.</p>
              <div className="financing-cta-actions">
                <a
                  href={specialistUrl}
                  target={store.whatsapp ? "_blank" : undefined}
                  rel={store.whatsapp ? "noopener noreferrer" : undefined}
                  className="button primary"
                >
                  {store.whatsapp && <WhatsAppIcon />} Avaliar pelo WhatsApp
                </a>
                <Link href="/" className="button secondary">
                  Ver Estoque para Troca
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter store={store} />
    </>
  );
}
