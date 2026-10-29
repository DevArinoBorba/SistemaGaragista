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
import { FinancingForm } from "@/components/financing-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStoreSettings } from "@/features/store/repository";
import { buildWhatsAppUrl } from "@/features/store/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSettings();
  return {
    title: `Financiamento | ${store.name}`,
    description: `Condições especiais de financiamento na ${store.name}. Simule e receba uma proposta personalizada.`,
  };
}

const pillars = [
  {
    icon: <ClockIcon />,
    title: "Aprovação Rápida",
    description: "Resposta em até 24 horas úteis",
  },
  {
    icon: <PercentIcon />,
    title: "Taxas Competitivas",
    description: "As melhores condições do mercado",
  },
  {
    icon: <FileCheckIcon />,
    title: "Sem Burocracia",
    description: "Processo simples e descomplicado",
  },
  {
    icon: <ShieldIcon />,
    title: "Até 100% Financiado",
    description: "Financiamento integral do veículo",
  },
];

const advantages = [
  "Aprovação em até 24 horas",
  "Taxas competitivas com condições especiais",
  "Financiamento de até 100% do veículo",
  "Parcelas que cabem no seu bolso",
  "Atendimento personalizado",
  "Parceria com os principais bancos",
  "Parcelamento em até 60x",
  "Aceitamos seu veículo na troca",
];

const steps = [
  {
    number: "01",
    title: "Preencha o Formulário",
    description: "Informe seus dados para iniciarmos a simulação.",
  },
  {
    number: "02",
    title: "Análise de Crédito",
    description: "Avaliamos seu perfil junto aos bancos parceiros.",
  },
  {
    number: "03",
    title: "Proposta Personalizada",
    description: "Apresentamos as melhores taxas e parcelas para você.",
  },
  {
    number: "04",
    title: "Realize seu Sonho",
    description: "Assine o contrato com praticidade e retire seu veículo.",
  },
];

export default async function FinancingPage() {
  const store = await getStoreSettings();
  const specialistUrl = store.whatsapp
    ? buildWhatsAppUrl(store.whatsapp, "financiamento de veículo")
    : "#contato";

  return (
    <>
      <SiteHeader store={store} />
      <main id="conteudo" className="financing-page">
        <section className="financing-hero" aria-labelledby="financing-title">
          <div className="financing-shell">
            <span className="financing-eyebrow">Financiamento</span>
            <h1 id="financing-title">Realize Seu Sonho Automotivo</h1>
            <p className="financing-lead">
              Condições especiais de financiamento para você sair de carro novo. Preencha o formulário e receba uma proposta personalizada.
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

        <section className="financing-main-section" aria-labelledby="request-title">
          <div className="financing-shell">
            <div className="financing-section-head">
              <h2 id="request-title">Solicite Seu Financiamento</h2>
              <p>Preencha o formulário abaixo e nossa equipe entrará em contato com as melhores condições.</p>
            </div>

            <div className="financing-grid">
              <FinancingForm
                storeName={store.name}
                whatsapp={store.whatsapp}
                phone={store.phone}
              />

              <div className="financing-side">
                <article className="financing-card">
                  <h3>Vantagens do Financiamento {store.name}</h3>
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
                  <h3>Como Funciona</h3>
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

        <section className="financing-cta-section" aria-labelledby="cta-title">
          <div className="financing-shell">
            <div className="financing-cta-box">
              <h2 id="cta-title">Dúvidas Sobre Financiamento?</h2>
              <p>Nossa equipe está pronta para ajudá-lo a encontrar as melhores condições de financiamento.</p>
              <div className="financing-cta-actions">
                <a
                  href={specialistUrl}
                  target={store.whatsapp ? "_blank" : undefined}
                  rel={store.whatsapp ? "noopener noreferrer" : undefined}
                  className="button primary"
                >
                  {store.whatsapp && <WhatsAppIcon />} Falar com Especialista
                </a>
                <Link href="/#estoque" className="button secondary">
                  Ver Estoque
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
