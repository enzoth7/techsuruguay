import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteConfig } from "@/src/lib/site";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: siteConfig.title,
    template: "%s | Techs Uruguay",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  keywords: [
    "empresas tech Uruguay",
    "startups Uruguay",
    "software Uruguay",
    "fintech Uruguay",
    "tecnología Uruguay",
    "ecosistema tecnológico uruguayo",
    "ranking empresas uruguayas",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "es-UY": "/",
      "x-default": "/",
    },
  },
  icons: {
    icon: [{ url: "/LogoTransp.png", type: "image/png", sizes: "1536x1024" }],
    shortcut: "/LogoTransp.png",
    apple: [{ url: "/LogoTransp.png", type: "image/png", sizes: "1536x1024" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/LogoTransp.png",
        width: 1536,
        height: 1024,
        alt: "Logo de Techs Uruguay",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/LogoTransp.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  other: {
    "content-language": siteConfig.language,
    "geo.region": siteConfig.countryCode,
    "geo.placename": siteConfig.countryName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#08111f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.language}>
      <body className={`${plexSans.variable} ${newsreader.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
