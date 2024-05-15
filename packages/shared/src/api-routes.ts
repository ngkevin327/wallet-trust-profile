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
    wallets: `/${API_VERSION}/me/wallets`,
    refresh: `/${API_VERSION}/me/profile/refresh`,
    exports: `/${API_VERSION}/me/exports`,
  },
  profiles: {
    bySlug: (slug: string) => `/${API_VERSION}/profiles/${slug}`,
    byWallet: (address: string) => `/${API_VERSION}/profiles/by-wallet/${address}`,
  },
} as const;
