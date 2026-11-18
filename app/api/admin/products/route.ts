import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { productInputSchema } from "@/lib/validation/admin";

export async function GET() {
  try {
    await requirePermission("content");
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const data = await prisma.product.findMany({ include: { category: true, media: true, specifications: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ data, meta: { total: data.length } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error && error.message === "FORBIDDEN" ? "Forbidden" : "Unauthorized" }, { status: error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401 }); }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("content");
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const parsed = productInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid product", issues: parsed.error.flatten() }, { status: 400 });
    const { specifications, ...product } = parsed.data;
    const created = await prisma.product.create({ data: { ...product, specifications: { create: specifications } }, include: { category: true, specifications: true } });
    await audit(actor.id, "create", "Product", created.id);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error && error.message === "FORBIDDEN" ? "Forbidden" : "Unauthorized" }, { status: error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401 }); }
}
