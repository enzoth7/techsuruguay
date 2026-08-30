const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

const normalizedSiteUrl = configuredSiteUrl.startsWith("http")
  ? configuredSiteUrl
  : "https://" + configuredSiteUrl;

export const siteConfig = {
  name: "Techs Uruguay",
  title: "Techs Uruguay | Startups y empresas tech de Uruguay",
  description:
    "Directorio editorial de startups, empresas tecnológicas y compañías de software de Uruguay. Explorá su sector, fundación, valoración estimada, servicios y equipos.",
  url: new URL(normalizedSiteUrl),
  locale: "es_UY",
  language: "es-UY",
  countryCode: "UY",
  countryName: "Uruguay",
} as const;
