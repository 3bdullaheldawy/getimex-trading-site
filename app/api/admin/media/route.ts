import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma, databaseConfigured } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { z } from "zod";

const allowedImages = new Set(["image/webp", "image/avif", "image/jpeg", "image/png"]);
const allowedVideos = new Set(["video/mp4"]);

export async function GET() { try { await requirePermission("content"); if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured" }, { status: 503 }); const data = await prisma.mediaAsset.findMany({ include: { product: { select: { slug: true, titleEn: true } } }, orderBy: { sortOrder: "asc" } }); return NextResponse.json({ data, meta: { total: data.length } }); } catch (error) { const forbidden = error instanceof Error && error.message === "FORBIDDEN"; return NextResponse.json({ error: forbidden ? "Forbidden" : "Unauthorized" }, { status: forbidden ? 403 : 401 }); } }

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("content");
    if (!databaseConfigured() || !process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Media storage is not configured" }, { status: 503 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "File is required" }, { status: 400 });
    const type = file.type.startsWith("video/") ? "video" : "image";
    const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    const allowed = type === "video" ? allowedVideos : allowedImages;
    if (!allowed.has(file.type) || file.size > maxSize) return NextResponse.json({ error: "Unsupported file type or size" }, { status: 400 });
    const altEn = String(form.get("altEn") ?? "").trim();
    const altAr = String(form.get("altAr") ?? "").trim();
    if (altEn.length < 2 || altAr.length < 2) return NextResponse.json({ error: "English and Arabic alt text are required" }, { status: 400 });
    const productId = String(form.get("productId") ?? "").trim() || undefined;
    const approved = String(form.get("approved") ?? "false") === "true";
    const pathname = `getimex/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const blob = await put(pathname, file, { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN, addRandomSuffix: false });
    const data = await prisma.mediaAsset.create({ data: { type, url: blob.url, pathname: blob.pathname, mimeType: file.type, size: file.size, altEn, altAr, captionEn: String(form.get("captionEn") ?? "") || null, captionAr: String(form.get("captionAr") ?? "") || null, category: String(form.get("category") ?? "") || null, approved, productId } });
    await audit(actor.id, "create", "MediaAsset", data.id, { type, size: file.size });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to upload media" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 500 }); }
}

export async function DELETE(request: Request) {
  try { const actor = await requirePermission("content"); if (!databaseConfigured() || !process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Media storage is not configured" }, { status: 503 }); const body = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => null)); if (!body.success) return NextResponse.json({ error: "Media id is required" }, { status: 400 }); const media = await prisma.mediaAsset.findUnique({ where: { id: body.data.id }, include: { product: true } }); if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 }); if (media.product?.isPublished) return NextResponse.json({ error: "Replace media on published content before deleting it" }, { status: 409 }); await prisma.mediaAsset.delete({ where: { id: media.id } }); if (media.pathname) await del(media.pathname, { token: process.env.BLOB_READ_WRITE_TOKEN }); await audit(actor.id, "delete", "MediaAsset", media.id); return NextResponse.json({ data: { deleted: true } }); } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message === "FORBIDDEN" ? "Forbidden" : message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to delete media" }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 500 }); }
}
