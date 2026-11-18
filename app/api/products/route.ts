import { NextResponse } from "next/server";
import { getLocale } from "@/lib/content";
import { listPublicProducts } from "@/lib/repositories/public";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = getLocale(url.searchParams.get("locale") ?? "en");
  const data = await listPublicProducts(locale, { category: url.searchParams.get("category") ?? undefined, q: url.searchParams.get("q")?.trim() || undefined, featured: url.searchParams.get("featured") === "true" });
  return NextResponse.json({ data, meta: { total: data.length, locale } });
}
