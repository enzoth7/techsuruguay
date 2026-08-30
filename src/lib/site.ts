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
  title: "Techs Uruguay | Startups, incubadoras y aceleradoras de Uruguay",
  description:
    "Directorio de startups y empresas tecnológicas de Uruguay, con incubadoras, aceleradoras, agencias y centros de apoyo para emprender e innovar.",
  url: new URL(normalizedSiteUrl),
  locale: "es_UY",
  language: "es-UY",
  countryCode: "UY",
  countryName: "Uruguay",
} as const;
