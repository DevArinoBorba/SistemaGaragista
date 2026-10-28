import type { MetadataRoute } from "next";
import { getPublicSiteUrl, getPublishedSitemapVehicles } from "@/features/vehicles/public";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  const published = await getPublishedSitemapVehicles();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    ...published.map((vehicle) => ({
      url: `${base}/veiculos/${vehicle.id}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
