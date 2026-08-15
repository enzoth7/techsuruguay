import type { MetadataRoute } from "next";
import { siteConfig } from "@/src/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#08111f",
    theme_color: "#08111f",
    lang: siteConfig.language,
    categories: ["business", "technology"],
    icons: [
      {
        src: "/LogoTransp.png",
        sizes: "1536x1024",
        type: "image/png",
      },
    ],
  };
}
