const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function adminHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Admin-Api-Key": apiKey,
  };
}

export async function adminFetch<T>(
  path: string,
  apiKey: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...adminHeaders(apiKey), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.message === "string" ? body.message : `Admin API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type RegistryProtocol = {
  id: string;
  slug: string;
  name: string;
  chainId: number;
  contract: string | null;
  category: string;
  active: boolean;
};

export type RegistryDao = {
  id: string;
  slug: string;
  name: string;
  chainId: number;
  treasury: string | null;
  active: boolean;
};

export async function listRegistrySnapshot(apiKey: string) {
  return adminFetch<{
    protocolCount: number;
    daoCount: number;
    protocols: {
      id: string;
      slug: string;
      chainId: number;
      contract: string | null;
      category: string;
    }[];
    daos: { id: string; slug: string; chainId: number; treasury: string | null }[];
  }>("/v1/internal/registry", apiKey);
}

export function createProtocol(apiKey: string, body: Record<string, unknown>) {
  return adminFetch<RegistryProtocol>("/v1/admin/registry/protocols", apiKey, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateProtocol(apiKey: string, id: string, body: Record<string, unknown>) {
  return adminFetch<RegistryProtocol>(`/v1/admin/registry/protocols/${id}`, apiKey, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteProtocol(apiKey: string, id: string) {
  return adminFetch<RegistryProtocol>(`/v1/admin/registry/protocols/${id}`, apiKey, {
    method: "DELETE",
  });
}

export function createDao(apiKey: string, body: Record<string, unknown>) {
  return adminFetch<RegistryDao>("/v1/admin/registry/daos", apiKey, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteDao(apiKey: string, id: string) {
  return adminFetch<RegistryDao>(`/v1/admin/registry/daos/${id}`, apiKey, {
    method: "DELETE",
  });
}

export function uploadScoringConfig(apiKey: string, yaml: string) {
  return adminFetch<{ version: string; path: string }>("/v1/admin/scoring-config", apiKey, {
    method: "POST",
    body: JSON.stringify({ yaml }),
  });
}
