import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/studio-85810eea57bc0ee6/"],
    },
    sitemap: "https://bubu-tarot.com/sitemap.xml",
    host: "https://bubu-tarot.com",
  };
}
