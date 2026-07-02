import type { Metadata } from "next";
import { Chakra_Petch, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const chakra = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "CyberAce — Courses de cybersécurité",
  description:
    "Plateforme gamifiée de challenges de cybersécurité façon course : cryptographie, réseau, Active Directory, forensic, cloud et plus. Programme M1-SSI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${chakra.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <div className="app-backdrop" />
        <div className="app-grid" />
        <Providers>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
