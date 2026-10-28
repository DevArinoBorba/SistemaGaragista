import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/features/vehicles/public";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/veiculos/"],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
