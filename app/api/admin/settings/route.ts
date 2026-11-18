import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { settingsSchema } from "@/lib/validation/admin";

export async function GET() { try { await requirePermission("settings"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); return NextResponse.json({ data: await prisma.siteSettings.findUnique({ where: { id: "singleton" } }) }); } catch (error) { const forbidden = error instanceof Error && error.message === "FORBIDDEN"; return NextResponse.json({ error: forbidden ? "Forbidden" : "Unauthorized" }, { status: forbidden ? 403 : 401 }); } }

export async function PATCH(request: Request) { try { const actor = await requirePermission("settings"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const parsed = settingsSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid settings", issues: parsed.error.flatten() }, { status: 400 }); const data = await prisma.siteSettings.upsert({ where: { id: "singleton" }, update: parsed.data, create: { id: "singleton", ...parsed.data } }); await audit(actor.id, "update", "SiteSettings", "singleton"); return NextResponse.json({ data }); } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to save settings" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 500 }); } }
