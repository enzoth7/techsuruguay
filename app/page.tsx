import TechUruguayLanding from "@/src/components/techsuruguay/TechUruguayLanding";
import { getPublishedCompanies } from "@/src/lib/published-companies";
import { slugifyCompanyName, sortCompanies } from "@/src/lib/techsuruguay";
import { siteConfig } from "@/src/lib/site";

export const revalidate = 3600;

export default async function Home() {
  const companies = sortCompanies(await getPublishedCompanies());
  const homeUrl = siteConfig.url.toString();
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
          "@type": "Country",
          name: siteConfig.countryName,
        },
        contentLocation: {
          "@type": "Country",
          name: siteConfig.countryName,
        },
        mainEntity: {
          "@type": "ItemList",
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
      },
      {
        "@type": "Dataset",
        "@id": homeUrl + "#dataset",
        name: "Directorio de startups y empresas tech de Uruguay",
        description: "Base editorial de empresas tecnológicas, startups y compañías de software con actividad en Uruguay.",
        url: homeUrl,
        inLanguage: siteConfig.language,
        spatialCoverage: {
          "@type": "Country",
          name: siteConfig.countryName,
        },
        keywords: ["startups Uruguay", "empresas tech Uruguay", "empresas de software Uruguay", "fintech Uruguay"],
        variableMeasured: ["sector", "año de fundación", "valoración estimada", "servicios", "equipo"],
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
