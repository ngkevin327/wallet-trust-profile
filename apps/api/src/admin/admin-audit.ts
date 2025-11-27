import { createHash } from "node:crypto";

export function adminActorId(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex").slice(0, 12);
}

export function auditAdminMutation(
  actorId: string,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>,
): void {
  console.log(
    JSON.stringify({
      event: "admin_audit",
      actorId,
      action,
      resource,
      metadata,
      timestamp: new Date().toISOString(),
    }),
  );
}
