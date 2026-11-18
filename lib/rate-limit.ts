import { createHash } from "node:crypto";
import { prisma, databaseConfigured } from "@/lib/db";

export async function enforceRateLimit(request: Request, bucket: string, limit: number, windowMs: number) {
  if (!databaseConfigured()) return true;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const keyHash = createHash("sha256").update(`${bucket}:${forwarded}`).digest("hex");
  const now = new Date();
  const existing = await prisma.rateLimitBucket.findUnique({ where: { keyHash } });
  if (!existing || now.getTime() - existing.windowStart.getTime() >= windowMs) {
    await prisma.rateLimitBucket.upsert({ where: { keyHash }, update: { windowStart: now, count: 1 }, create: { keyHash, windowStart: now, count: 1 } });
    return true;
  }
  if (existing.count >= limit) return false;
  await prisma.rateLimitBucket.update({ where: { keyHash }, data: { count: { increment: 1 } } });
  return true;
}
