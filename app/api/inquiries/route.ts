import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { inquirySchema } from "@/lib/validation/admin";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET() { return NextResponse.json({ error: "Use the authenticated admin inquiries endpoint" }, { status: 401 }); }

export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Quotation service is not configured" }, { status: 503 });
  if (!(await enforceRateLimit(request, "inquiries", 8, 60_000))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.website || (parsed.data.formStartedAt && Date.now() - parsed.data.formStartedAt < 1200)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const product = parsed.data.productSlug ? await prisma.product.findUnique({ where: { slug: parsed.data.productSlug }, select: { id: true } }) : null;
  const inquiry = await prisma.inquiry.create({ data: { name: parsed.data.name, company: parsed.data.company, phone: parsed.data.phone, email: parsed.data.email || null, category: parsed.data.category, productSlug: parsed.data.productSlug || null, source: parsed.data.source || null, message: parsed.data.message, locale: parsed.data.locale, productId: product?.id } });
  return NextResponse.json({ data: inquiry, meta: { total: 1, locale: parsed.data.locale } }, { status: 201 });
}
