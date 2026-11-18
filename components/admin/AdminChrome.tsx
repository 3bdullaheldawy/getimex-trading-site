"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DubaiClock } from "@/components/Motion";
import { IconBox, IconClose, IconDashboard, IconExternal, IconImage, IconInbox, IconLayers, IconLogout, IconMenu, IconSettings, IconUsers } from "@/components/admin/AdminIcons";

export type AdminRole = "SuperAdmin" | "ContentEditor" | "SalesInbox";
type User = { name: string; email: string; role?: AdminRole };

const roleLabel: Record<AdminRole, string> = { SuperAdmin: "Super admin", ContentEditor: "Content editor", SalesInbox: "Sales inbox" };
const can = (role: AdminRole | undefined, area: "content" | "sales" | "admin") => role === "SuperAdmin" || (area === "content" && role === "ContentEditor") || (area === "sales" && role === "SalesInbox");

export function AdminChrome({ user, dbReady, newInquiries, children }: { user: User; dbReady: boolean; newInquiries: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  const groups = [
    { label: "Workspace", items: [
      { href: "/admin", label: "Overview", icon: IconDashboard, show: true },
      { href: "/admin/inquiries", label: "Quotation inbox", icon: IconInbox, show: can(user.role, "sales"), count: newInquiries },
      { href: "/admin/products", label: "Products", icon: IconBox, show: can(user.role, "content") },
      { href: "/admin/categories", label: "Categories", icon: IconLayers, show: can(user.role, "content") },
      { href: "/admin/media", label: "Media library", icon: IconImage, show: can(user.role, "content") },
    ] },
    { label: "Administration", items: [
      { href: "/admin/users", label: "Team & access", icon: IconUsers, show: can(user.role, "admin") },
      { href: "/admin/settings", label: "Site settings", icon: IconSettings, show: can(user.role, "admin") },
    ] },
  ];
  const all = groups.flatMap((g) => g.items);
  const current = [...all].sort((a, b) => b.href.length - a.href.length).find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const initials = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";

  return <div className={`cms ${open ? "nav-open" : ""}`}>
    <aside className="cms-side" aria-label="CMS navigation">
      <Link href="/admin" className="cms-logo"><Image src="/images/logo-light.png" alt="Getimex" width={560} height={233} priority /><span>CMS</span></Link>
      {groups.map((group) => {
        const items = group.items.filter((item) => item.show);
        if (!items.length) return null;
        return <div key={group.label}>
          <div className="cms-nav-label">{group.label}</div>
          <nav className="cms-nav">{items.map((item) => {
            const Icon = item.icon;
            const active = current?.href === item.href;
            return <Link key={item.href} href={item.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}><Icon />{item.label}{"count" in item && item.count ? <span className="count">{item.count}</span> : null}</Link>;
          })}</nav>
        </div>;
      })}
      <div className="cms-side-foot">
        <div className="cms-user"><span className="cms-avatar">{initials}</span><div><strong>{user.name}</strong><small>{user.role ? roleLabel[user.role] : user.email}</small></div></div>
        <div className="cms-side-links"><Link href="/en" target="_blank"><IconExternal size={15} />Website</Link><a href="/api/auth/signout"><IconLogout size={15} />Sign out</a></div>
      </div>
    </aside>
    {open && <div className="drawer-scrim" style={{ zIndex: 65 }} onClick={() => setOpen(false)} />}
    <div className="cms-main">
      <header className="cms-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" className="cms-burger" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <IconClose /> : <IconMenu />}</button>
          <div className="cms-crumb"><span className="hide-sm">Getimex CMS</span><span className="hide-sm">/</span><b>{current?.label ?? "Overview"}</b></div>
        </div>
        <div className="cms-top-right">
          <span className={`cms-status ${dbReady ? "" : "off"}`} title={dbReady ? "PostgreSQL is configured" : "DATABASE_URL is not set"}><i /><span>{dbReady ? "Database configured" : "Database not configured"}</span></span>
          <span className="hide-sm">Dubai <DubaiClock withSeconds={false} /></span>
        </div>
      </header>
      <main className="cms-content" key={pathname}>{children}</main>
    </div>
  </div>;
}
