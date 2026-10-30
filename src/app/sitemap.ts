import type { MetadataRoute } from "next";
import { getPublicSiteUrl, getPublishedSitemapVehicles } from "@/features/vehicles/public";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  const published = await getPublishedSitemapVehicles();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/venda-seu-veiculo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/financiamento`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contato`, changeFrequency: "monthly", priority: 0.7 },
    ...published.map((vehicle) => ({
      url: `${base}/veiculos/${vehicle.id}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
