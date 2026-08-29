import type { MetadataRoute } from "next";

const origin = "https://bubu-tarot.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/booking", priority: 0.95, changeFrequency: "weekly" },
    { path: "/dream", priority: 0.85, changeFrequency: "weekly" },
    { path: "/reality", priority: 0.85, changeFrequency: "weekly" },
    { path: "/ideas", priority: 0.75, changeFrequency: "weekly" },
    { path: "/policies", priority: 0.55, changeFrequency: "monthly" },
    { path: "/policies/service", priority: 0.45, changeFrequency: "monthly" },
    { path: "/policies/risk", priority: 0.45, changeFrequency: "monthly" },
    { path: "/policies/privacy", priority: 0.45, changeFrequency: "monthly" },
    { path: "/policies/refund", priority: 0.45, changeFrequency: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${origin}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
