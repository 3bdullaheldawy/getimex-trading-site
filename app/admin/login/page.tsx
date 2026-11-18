import Image from "next/image";
import Link from "next/link";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { photos } from "@/lib/content";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <main className="login">
    <section className="login-visual">
      <Image className="bg" src={photos.containers} alt="" fill priority sizes="55vw" />
      <Image className="brand-img" src="/images/logo-light.png" alt="Getimex General Trading L.L.C." width={560} height={233} priority />
      <div>
        <h2>The workspace behind every quotation.</h2>
        <p>Catalogue, media and the sales inbox for getimex.com — in one protected place.</p>
        <div className="login-meta"><span>Dubai · UAE</span><span>Getimex CMS</span></div>
      </div>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <span className="mono">Team sign-in</span>
        <h1>Welcome back.</h1>
        <p>Use the credentials issued by your Getimex administrator.</p>
        <AdminLoginForm />
        <p className="login-foot">Not on the team? <Link href="/en">Return to the website</Link></p>
      </div>
    </section>
  </main>;
}
