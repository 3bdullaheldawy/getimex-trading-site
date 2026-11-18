import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { categoryInputSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = await requirePermission("content"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const { id } = await params; const parsed = categoryInputSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid category", issues: parsed.error.flatten() }, { status: 400 }); const data = await prisma.productCategory.update({ where: { id }, data: parsed.data }); await audit(actor.id, "update", "ProductCategory", id); return NextResponse.json({ data }); } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Category not found" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 404 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = await requirePermission("content"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const { id } = await params; const category = await prisma.productCategory.findUnique({ where: { id }, include: { _count: { select: { products: true } } } }); if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 }); if (category._count.products) return NextResponse.json({ error: "Move products before deleting this category" }, { status: 409 }); const data = await prisma.productCategory.delete({ where: { id } }); await audit(actor.id, "delete", "ProductCategory", id); return NextResponse.json({ data }); } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Category cannot be deleted" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 409 }); }
}
