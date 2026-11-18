import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { inquiryStatusSchema } from "@/lib/validation/admin";
import { z } from "zod";

const updateSchema = z.object({ status: inquiryStatusSchema.optional(), salesNotes: z.string().trim().max(5000).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = await requirePermission("sales"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const { id } = await params; const parsed = updateSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid inquiry", issues: parsed.error.flatten() }, { status: 400 }); const data = await prisma.inquiry.update({ where: { id }, data: { ...parsed.data, lastEditedById: actor.id } }); await audit(actor.id, "update", "Inquiry", id, parsed.data); return NextResponse.json({ data }); } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Inquiry not found" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 404 }); }
}
