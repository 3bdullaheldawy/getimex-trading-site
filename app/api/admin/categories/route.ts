import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { categoryInputSchema } from "@/lib/validation/admin";

export async function GET() {
  try { await requirePermission("content"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const data = await prisma.productCategory.findMany({ include: { _count: { select: { products: true } } }, orderBy: { sortOrder: "asc" } }); return NextResponse.json({ data, meta: { total: data.length } }); } catch (error) { const forbidden = error instanceof Error && error.message === "FORBIDDEN"; return NextResponse.json({ error: forbidden ? "Forbidden" : "Unauthorized" }, { status: forbidden ? 403 : 401 }); }
}

export async function POST(request: Request) {
  try { const actor = await requirePermission("content"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const parsed = categoryInputSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid category", issues: parsed.error.flatten() }, { status: 400 }); const data = await prisma.productCategory.create({ data: parsed.data }); await audit(actor.id, "create", "ProductCategory", data.id); return NextResponse.json({ data }, { status: 201 }); } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Category already exists" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 409 }); }
}
