import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const display = Fraunces({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display-src",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "CyberAce — Parcours d'apprentissage",
  description:
    "Un parcours serein à travers 4 checkpoints — Algorithmique, Système d'exploitation, Base de données et Cybersécurité — présenté comme une route paisible traversant une ville.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${display.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}>
      <head>
        {/* Anti-FOUC : pose la classe `dark` sur <html> AVANT l'hydratation React
            (sinon flash clair au chargement en mode sombre). Purement client. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cyberace-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh font-sans">
        <div className="app-backdrop" />
        <div className="app-grid" />
        <Providers>
          <ScrollToTop />
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
