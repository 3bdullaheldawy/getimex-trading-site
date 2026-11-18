import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function audit(actorId: string | undefined, action: string, entity: string, entityId?: string, metadata?: Record<string, unknown>) {
  await prisma.auditLog.create({ data: { actorId, action, entity, entityId, metadata: metadata as Prisma.InputJsonValue | undefined } });
}
