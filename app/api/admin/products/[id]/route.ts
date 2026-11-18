import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { productInputSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("content");
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const { id } = await params;
    const parsed = productInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid product", issues: parsed.error.flatten() }, { status: 400 });
    const { specifications, ...product } = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productSpecification.deleteMany({ where: { productId: id } });
      return tx.product.update({ where: { id }, data: { ...product, specifications: { create: specifications } }, include: { category: true, specifications: true } });
    });
    await audit(actor.id, "update", "Product", id);
    return NextResponse.json({ data: updated });
  } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Product not found" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 404 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("content");
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const { id } = await params;
    const deleted = await prisma.product.delete({ where: { id } });
    await audit(actor.id, "delete", "Product", id);
    return NextResponse.json({ data: deleted });
  } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Product cannot be deleted" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 409 }); }
}
