import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Garagista",
  description: "Catálogo de veículos e gestão de anúncios para garagistas.",
};

export const viewport: Viewport = {
  themeColor: "#0c0b10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${bodoni.variable}`}
    >
      <body><a className="skip-link" href="#conteudo">Pular para o conteúdo</a>{children}</body>
    </html>
  );
}
