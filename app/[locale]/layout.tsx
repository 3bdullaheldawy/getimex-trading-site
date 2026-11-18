import { PageFrame } from "@/components/SiteShell";
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) { const { locale } = await params; return <PageFrame locale={locale}>{children}</PageFrame>; }
