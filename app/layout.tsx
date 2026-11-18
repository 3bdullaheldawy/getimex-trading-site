import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import "./experience.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-arabic", display: "swap" });
const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"], weight: ["500", "600", "700", "800"], variable: "--font-kufi", display: "swap" });

export const metadata: Metadata = { title: { default: "Getimex General Trading L.L.C.", template: "%s · Getimex" }, description: "Reliable trading and supply solutions from Dubai for energy, industrial and infrastructure sectors.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), icons: { icon: "/images/logo-ink.png" }, openGraph: { title: "Getimex General Trading L.L.C.", description: "Reliable trading and supply solutions from Dubai.", type: "website" } };

export const viewport: Viewport = { themeColor: "#081830" };

const motionBoot = "try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');if(location.pathname.indexOf('/admin')!==0&&!sessionStorage.getItem('gtx-intro'))d.classList.add('is-loading')}}catch(e){}";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html className={`${archivo.variable} ${plexMono.variable} ${plexArabic.variable} ${kufi.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: motionBoot }} /></head><body>{children}</body></html>;
}
