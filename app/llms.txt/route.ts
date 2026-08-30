import { getPublishedCompanies } from "@/src/lib/published-companies";
import { siteConfig } from "@/src/lib/site";
import { slugifyCompanyName, sortCompanies } from "@/src/lib/techsuruguay";
import {
  SUPPORT_ECOSYSTEM_DESCRIPTION,
  SUPPORT_ECOSYSTEM_ID,
  SUPPORT_ECOSYSTEM_TITLE,
  SUPPORT_ORGANIZATIONS,
} from "@/src/lib/support-organizations";

export const revalidate = 3600;

export async function GET() {
  const companies = sortCompanies(await getPublishedCompanies());
  const supportSectionUrl = new URL(`/#${SUPPORT_ECOSYSTEM_ID}`, siteConfig.url).toString();
  const lines = [
    "# Techs Uruguay",
    "",
    "> Directorio editorial de startups, empresas tecnológicas, incubadoras, aceleradoras y centros de apoyo con actividad en Uruguay.",
    "",
    "## Propósito",
    "",
    "Techs Uruguay ayuda a descubrir el ecosistema tecnológico y emprendedor uruguayo mediante fichas de empresas y una selección de incubadoras, aceleradoras, agencias, universidades y organizaciones de apoyo.",
    "",
    "## Directorio de empresas",
    "",
    ...companies.map((company) => {
      const profileUrl = new URL(`/empresas/${slugifyCompanyName(company.name)}`, siteConfig.url).toString();
      const facts = [
        company.sector || "empresa tecnológica",
        company.founded ? `fundada en ${company.founded}` : "año de fundación sin datos",
      ].join("; ");

      return `- [${company.name}](${profileUrl}): ${facts}. ${company.description || "Ficha editorial disponible en Techs Uruguay."}`;
    }),
    "",
    `## ${SUPPORT_ECOSYSTEM_TITLE}`,
    "",
    SUPPORT_ECOSYSTEM_DESCRIPTION,
    "",
    ...SUPPORT_ORGANIZATIONS.map(
      (organization) => `- [${organization.name}](${organization.website}): organización del ecosistema de apoyo a startups, innovación y emprendimiento en Uruguay.`,
    ),
    "",
    `Sección en Techs Uruguay: ${supportSectionUrl}`,
    "",
    `Fuente principal: ${siteConfig.url.toString()}`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
