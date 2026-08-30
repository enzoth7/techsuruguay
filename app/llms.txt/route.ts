import { getPublishedCompanies } from "@/src/lib/published-companies";
import { siteConfig } from "@/src/lib/site";
import { slugifyCompanyName, sortCompanies } from "@/src/lib/techsuruguay";

export const revalidate = 3600;

export async function GET() {
  const companies = sortCompanies(await getPublishedCompanies());
  const lines = [
    "# Techs Uruguay",
    "",
    "> Directorio editorial de startups, empresas tecnológicas y compañías de software con actividad en Uruguay.",
    "",
    "## Propósito",
    "",
    "Techs Uruguay ayuda a descubrir el ecosistema tecnológico uruguayo mediante fichas con sector, fundación, valoración estimada cuando está disponible, servicios y equipo.",
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
    `Fuente principal: ${siteConfig.url.toString()}`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
