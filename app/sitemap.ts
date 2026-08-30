import { MetadataRoute } from "next";
import { getPublishedCompanies } from "@/src/lib/published-companies";
import { siteConfig } from "@/src/lib/site";
import { slugifyCompanyName } from "@/src/lib/techsuruguay";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeUrl = siteConfig.url.toString();
  const companies = await getPublishedCompanies();

  return [
    {
      url: homeUrl,
      changeFrequency: "weekly",
      priority: 1,
      images: [new URL("/LogoTransp.png", siteConfig.url).toString()],
      alternates: {
        languages: {
          "es-UY": homeUrl,
          "x-default": homeUrl,
        },
      },
    },
    ...companies.map((company) => ({
      url: new URL(`/empresas/${slugifyCompanyName(company.name)}`, siteConfig.url).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: company.logoUrl ? [new URL(company.logoUrl, siteConfig.url).toString()] : undefined,
    })),
  ];
}
