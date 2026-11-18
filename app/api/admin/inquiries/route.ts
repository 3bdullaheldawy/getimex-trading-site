import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function GET(request: Request) {
  try { await requirePermission("sales"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const url = new URL(request.url); const status = url.searchParams.get("status") as "New" | "InReview" | "Replied" | "Closed" | null; const data = await prisma.inquiry.findMany({ where: status ? { status } : undefined, include: { product: true, lastEditedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }); return NextResponse.json({ data, meta: { total: data.length } }); } catch (error) { const forbidden = error instanceof Error && error.message === "FORBIDDEN"; return NextResponse.json({ error: forbidden ? "Forbidden" : "Unauthorized" }, { status: forbidden ? 403 : 401 }); }
}
