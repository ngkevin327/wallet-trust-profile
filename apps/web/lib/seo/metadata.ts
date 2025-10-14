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
  reputationIndex?: number | null;
  topBadge?: string | null;
}): Metadata {
  const title = params.displayName ?? params.slug;
  const description =
    params.reputationIndex != null
      ? `${title} has a reputation index of ${params.reputationIndex} on Onchain Reputation.`
      : `On-chain reputation profile for ${title}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      type: "profile",
      url: `/u/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
    },
  };
}
