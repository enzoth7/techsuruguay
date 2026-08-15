import { MetadataRoute } from "next";
import { siteConfig } from "@/src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const homeUrl = siteConfig.url.toString();

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
  ];
}
