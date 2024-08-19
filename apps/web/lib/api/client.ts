import { API_ROUTES } from "@onchain-reputation/shared";
import { clearAccessToken, getAccessToken } from "../auth/token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body.code);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  getMyProfile: () => apiFetch(API_ROUTES.me.profile),
  getMyWallets: () => apiFetch(API_ROUTES.me.wallets),
  getPublicProfile: (slug: string) => apiFetch(API_ROUTES.profiles.bySlug(slug), { auth: false }),
};
