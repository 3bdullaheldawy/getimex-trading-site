import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { eventSchema } from "@/lib/validation/admin";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Analytics is not configured" }, { status: 503 });
  if (!(await enforceRateLimit(request, "events", 60, 60_000))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event", issues: parsed.error.flatten() }, { status: 400 });
  await prisma.analyticsEvent.create({ data: parsed.data });
  return NextResponse.json({ data: { accepted: true }, meta: { locale: parsed.data.locale } }, { status: 201 });
}
