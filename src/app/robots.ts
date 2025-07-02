import type { MetadataRoute } from "next";
import { HOME_DOMAIN } from "@/lib/construct-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/dashboard/",
          "/settings/",
          "/onboarding/",
          "/auth/",
          "/login/",
          "/register/",
          "/checkout/",
          "/billing/",
          "/account/",
          "/workspace/",
          "/app/",
          "/private/",
          "*.json",
        ],
      },
    ],
    sitemap: `${HOME_DOMAIN}/sitemap.xml`,
  };
}