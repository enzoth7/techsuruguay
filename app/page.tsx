import TechUruguayLanding from "@/src/components/techsuruguay/TechUruguayLanding";
import { getPublishedCompanies } from "@/src/lib/published-companies";
import { slugifyCompanyName, sortCompanies } from "@/src/lib/techsuruguay";
import { siteConfig } from "@/src/lib/site";
import {
  SUPPORT_ECOSYSTEM_DESCRIPTION,
  SUPPORT_ECOSYSTEM_ID,
  SUPPORT_ECOSYSTEM_TITLE,
  SUPPORT_ORGANIZATIONS,
} from "@/src/lib/support-organizations";

export const revalidate = 3600;

export default async function Home() {
  const companies = sortCompanies(await getPublishedCompanies());
  const homeUrl = siteConfig.url.toString();
  const supportSectionUrl = new URL(`/#${SUPPORT_ECOSYSTEM_ID}`, siteConfig.url).toString();
  const rankingListId = homeUrl + "#ranking-list";
  const supportListId = homeUrl + "#support-ecosystem-list";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": homeUrl + "#organization",
        name: siteConfig.name,
        url: homeUrl,
        logo: new URL("/Logo.png", siteConfig.url).toString(),
        description: siteConfig.description,
        areaServed: {
          "@type": "Country",
          name: siteConfig.countryName,
        },
      },
      {
        "@type": "WebSite",
        "@id": homeUrl + "#website",
        url: homeUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        areaServed: {
          "@type": "Country",
          name: siteConfig.countryName,
        },
      },
      {
        "@type": "CollectionPage",
        "@id": homeUrl + "#ranking",
        url: homeUrl,
        name: siteConfig.title,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        isPartOf: {
          "@id": homeUrl + "#website",
        },
        publisher: {
          "@id": homeUrl + "#organization",
        },
        about: {
          "@type": "Thing",
          name: "Ecosistema tecnológico y emprendedor de Uruguay",
        },
        contentLocation: {
          "@type": "Country",
          name: siteConfig.countryName,
        },
        mainEntity: [
          { "@id": rankingListId },
          { "@id": supportListId },
        ],
        hasPart: {
          "@type": "WebPageElement",
          "@id": homeUrl + `#${SUPPORT_ECOSYSTEM_ID}`,
          url: supportSectionUrl,
          name: SUPPORT_ECOSYSTEM_TITLE,
          description: SUPPORT_ECOSYSTEM_DESCRIPTION,
        },
      },
      {
        "@type": "ItemList",
        "@id": rankingListId,
        name: "Ranking de empresas tech de Uruguay",
        numberOfItems: companies.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: companies.map((company, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Organization",
            name: company.name,
            url: new URL(`/empresas/${slugifyCompanyName(company.name)}`, siteConfig.url).toString(),
            description: company.description || undefined,
            foundingDate: company.founded ? String(company.founded) : undefined,
            industry: company.sector || undefined,
            sameAs: company.website || undefined,
            areaServed: {
              "@type": "Country",
              name: siteConfig.countryName,
            },
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": supportListId,
        name: SUPPORT_ECOSYSTEM_TITLE,
        description: SUPPORT_ECOSYSTEM_DESCRIPTION,
        url: supportSectionUrl,
        numberOfItems: SUPPORT_ORGANIZATIONS.length,
        itemListOrder: "https://schema.org/ItemListUnordered",
        itemListElement: SUPPORT_ORGANIZATIONS.map((organization, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Organization",
            name: organization.name,
            url: organization.website,
            logo: new URL(organization.logo, siteConfig.url).toString(),
            areaServed: {
              "@type": "Country",
              name: siteConfig.countryName,
            },
            knowsAbout: ["Startups", "Emprendimiento", "Innovación"],
          },
        })),
      },
      {
        "@type": "Dataset",
        "@id": homeUrl + "#dataset",
        name: "Directorio del ecosistema tecnológico y emprendedor de Uruguay",
        description: "Base editorial de startups, empresas tecnológicas, incubadoras, aceleradoras y centros de apoyo con actividad en Uruguay.",
        url: homeUrl,
        inLanguage: siteConfig.language,
        spatialCoverage: {
          "@type": "Country",
          name: siteConfig.countryName,
        },
        keywords: [
          "startups Uruguay",
          "empresas tech Uruguay",
          "empresas de software Uruguay",
          "fintech Uruguay",
          "incubadoras Uruguay",
          "aceleradoras Uruguay",
          "centros de apoyo para emprendedores Uruguay",
          "ecosistema emprendedor Uruguay",
        ],
        variableMeasured: ["sector", "año de fundación", "valoración estimada", "servicios", "equipo", "organizaciones de apoyo"],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <TechUruguayLanding initialCompanies={companies} />
    </>
  );
}
