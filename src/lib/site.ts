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
  title: "Ranking de empresas tech de Uruguay | Techs Uruguay",
  description:
    "Descubrí empresas tecnológicas, startups y compañías de software de Uruguay, ordenadas por valoración y con información sobre sus servicios y fundadores.",
  url: new URL(normalizedSiteUrl),
  locale: "es_UY",
  language: "es-UY",
  countryCode: "UY",
  countryName: "Uruguay",
} as const;
