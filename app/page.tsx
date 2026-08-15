import TechUruguayLanding from "@/src/components/techsuruguay/TechUruguayLanding";
import { sortCompanies, TECHSURUGUAY_COMPANIES } from "@/src/lib/techsuruguay";
import { siteConfig } from "@/src/lib/site";

export default function Home() {
  const companies = sortCompanies(TECHSURUGUAY_COMPANIES);
  const homeUrl = siteConfig.url.toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
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
              url: company.website || undefined,
              description: company.description || undefined,
              foundingDate: company.founded ? String(company.founded) : undefined,
              areaServed: {
                "@type": "Country",
                name: siteConfig.countryName,
              },
            },
          })),
        },
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
      <TechUruguayLanding />
    </>
  );
}
