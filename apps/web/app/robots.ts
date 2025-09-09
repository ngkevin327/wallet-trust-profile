import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/u/", "/faq", "/how-it-works"],
        disallow: ["/dashboard", "/settings", "/onboarding", "/api"],
      },
    ],
  };
}
