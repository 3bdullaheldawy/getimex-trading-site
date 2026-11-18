import { NextResponse } from "next/server";
import { getLocale } from "@/lib/content";
import { getPublicProduct } from "@/lib/repositories/public";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = getLocale(new URL(_request.url).searchParams.get("locale") ?? "en");
  const product = await getPublicProduct(slug, locale);
  if (!product) return NextResponse.json({ error: "Product family not found" }, { status: 404 });
  return NextResponse.json({ data: product, meta: { total: 1, locale } });
}
