import type { Metadata } from "next";
import { Inter, Montserrat, Anton } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800"],
});
const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://goiasfa.vercel.app"),
  title: "Goiás F.A. - Futebol Americano",
  description: "Site oficial do Goiás F.A.: notícias, agenda, seletiva e loja de uniformes.",
  openGraph: {
    title: "Goiás F.A. - Futebol Americano",
    description: "Site oficial do Goiás F.A.: notícias, agenda, seletiva e loja de uniformes.",
    siteName: "Goiás F.A.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${montserrat.variable} ${anton.variable} font-sans antialiased bg-chalk text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
