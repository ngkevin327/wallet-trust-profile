export const API_VERSION = "v1";

export const API_ROUTES = {
  health: "/health",
  ready: "/ready",
  auth: {
    nonce: `/${API_VERSION}/auth/nonce`,
    verify: `/${API_VERSION}/auth/verify`,
    logout: `/${API_VERSION}/auth/logout`,
  },
  me: {
    profile: `/${API_VERSION}/me/profile`,
    slugCheck: (slug: string) => `/${API_VERSION}/me/profile/slug/${slug}/check`,
    scoreBreakdown: `/${API_VERSION}/me/profile/score-breakdown`,
    scoresBreakdown: `/${API_VERSION}/me/scores/breakdown`,
    wallets: `/${API_VERSION}/me/wallets`,
    refresh: `/${API_VERSION}/me/profile/refresh`,
    exports: `/${API_VERSION}/me/exports`,
    scoresHistory: `/${API_VERSION}/me/scores/history`,
  },
  billing: {
    checkout: `/${API_VERSION}/billing/checkout`,
    portal: `/${API_VERSION}/billing/portal`,
    subscription: `/${API_VERSION}/billing/subscription`,
  },
  verify: {
    export: (exportId: string) => `/${API_VERSION}/verify/${exportId}`,
  },
  profiles: {
    bySlug: (slug: string) => `/${API_VERSION}/profiles/${slug}`,
    byWallet: (address: string) => `/${API_VERSION}/profiles/by-wallet/${address}`,
  },
} as const;
