import { NextResponse } from "next/server";
import { getLocale } from "@/lib/content";
import { listPublicCategories } from "@/lib/repositories/public";

export async function GET(request: Request) {
  const locale = getLocale(new URL(request.url).searchParams.get("locale") ?? "en");
  const data = await listPublicCategories(locale);
  return NextResponse.json({ data, meta: { total: data.length, locale } });
}
