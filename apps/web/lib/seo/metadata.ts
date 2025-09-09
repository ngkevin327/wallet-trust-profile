import type { Metadata } from "next";

const siteName = "Onchain Reputation";

export const defaultMetadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    "Professional reputation profiles built from verifiable wallet activity — governance, DAO contributions, and payment reliability.",
  openGraph: {
    type: "website",
    siteName,
  },
};

export function profileMetadata(params: {
  displayName: string | null;
  slug: string;
}): Metadata {
  const title = params.displayName ?? params.slug;
  return {
    title,
    description: `On-chain reputation profile for ${title}`,
    openGraph: {
      title: `${title} | ${siteName}`,
      description: `Reputation index and activity summary for @${params.slug}`,
    },
  };
}
