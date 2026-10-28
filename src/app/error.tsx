"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main id="conteudo" className="message-page"><h1>Não foi possível carregar.</h1><p>Tente novamente em alguns instantes.</p><button className="button primary" onClick={reset}>Tentar novamente</button><Link className="text-link" href="/">Voltar ao início</Link></main>;
}
