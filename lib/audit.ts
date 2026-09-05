import { createClient } from "@/lib/supabase/server";
import type { AuditAction } from "@/types";

export async function logAudit({
  userId,
  action,
  resource,
  resourceId,
  metadata,
}: {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId ?? null,
    metadata: metadata ?? null,
  });
  if (error) throw new Error(`Unable to record audit event: ${error.message}`);
}
