import Link from "next/link";
import { auth } from "@/auth";
import { databaseConfigured, prisma } from "@/lib/db";
import { categories } from "@/lib/content";
import { IconBox, IconChevron, IconImage, IconInbox, IconLayers, IconSettings, IconUsers } from "@/components/admin/AdminIcons";

export const dynamic = "force-dynamic";

type Stats = { inquiries: Record<string, number>; inquiryTotal: number; weekInquiries: number; products: number; published: number; categories: number; media: number; users: number; recent: { id: string; name: string; company: string; category: string; status: string; createdAt: Date }[] };

async function loadStats(): Promise<Stats | null> {
  if (!databaseConfigured()) return null;
  try {
    const weekAgo = new Date(Date.now() - 7 * 86400_000);
    const [grouped, weekInquiries, products, published, categories, media, users, recent] = await Promise.all([
      prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.inquiry.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.productCategory.count(),
      prisma.mediaAsset.count(),
      prisma.adminUser.count({ where: { isActive: true } }),
      prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, company: true, category: true, status: true, createdAt: true } }),
    ]);
    const inquiries = Object.fromEntries(grouped.map((row) => [row.status, row._count._all]));
    return { inquiries, inquiryTotal: Object.values(inquiries).reduce((a, b) => a + b, 0), weekInquiries, products, published, categories, media, users, recent };
  } catch { return null; }
}

const pill: Record<string, string> = { New: "pill-new", InReview: "pill-review", Replied: "pill-replied", Closed: "pill-closed" };
const statusLabel: Record<string, string> = { New: "New", InReview: "In review", Replied: "Replied", Closed: "Closed" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dubai" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export default async function AdminOverview() {
  const session = await auth();
  const role = session?.user?.role;
  const sales = role === "SuperAdmin" || role === "SalesInbox";
  const content = role === "SuperAdmin" || role === "ContentEditor";
  const stats = await loadStats();
  const first = (session?.user?.name ?? "").split(" ")[0];
  const n = (value: number | undefined) => (stats ? String(value ?? 0) : "—");
  const statuses = ["New", "InReview", "Replied", "Closed"];
  const barColors: Record<string, string> = { New: "#ee6a1b", InReview: "#3b82f6", Replied: "#16a34a", Closed: "#a8a29e" };

  return <>
    <section className="welcome">
      <span className="mono">{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dubai" }).format(new Date())}</span>
      <h1>{greeting()}{first ? `, ${first}` : ""}.</h1>
      <p>{stats ? (sales && stats.inquiries.New ? `${stats.inquiries.New} quotation request${stats.inquiries.New === 1 ? "" : "s"} waiting for a first reply.` : "Everything is up to date. Here is where the workspace stands today.") : "The CMS is ready. Connect PostgreSQL to start receiving quotation requests and editing the catalogue."}</p>
      <div className="welcome-actions">
        {sales && <Link className="btn btn-accent" href="/admin/inquiries">Open inbox</Link>}
        {content && <Link className="btn" href="/admin/products">Manage products</Link>}
        <Link className="btn" href="/en" target="_blank">View website</Link>
      </div>
    </section>

    <section className="kpis">
      {sales && <div className="panel kpi"><div className="kpi-label">Quotation requests<IconInbox size={17} /></div><div className="kpi-value">{n(stats?.inquiryTotal)}</div><div className="kpi-foot">{stats ? <><b>+{stats.weekInquiries}</b> in the last 7 days</> : "Awaiting database"}</div>
        {stats && stats.inquiryTotal > 0 && <div className="kpi-bar" aria-hidden="true">{statuses.map((s) => <span key={s} style={{ width: `${((stats.inquiries[s] ?? 0) / stats.inquiryTotal) * 100}%`, background: barColors[s] }} />)}</div>}
      </div>}
      {sales && <div className="panel kpi"><div className="kpi-label">Waiting for reply<IconInbox size={17} /></div><div className="kpi-value">{n(stats?.inquiries.New)}</div><div className="kpi-foot">{stats ? `${stats.inquiries.InReview ?? 0} currently in review` : "Awaiting database"}</div></div>}
      {content && <div className="panel kpi"><div className="kpi-label">Published products<IconBox size={17} /></div><div className="kpi-value">{n(stats?.published)}</div><div className="kpi-foot">{stats ? `of ${stats.products} in the catalogue` : "Snapshot catalogue is live"}</div></div>}
      {content && <div className="panel kpi"><div className="kpi-label">Media assets<IconImage size={17} /></div><div className="kpi-value">{n(stats?.media)}</div><div className="kpi-foot">{stats ? `${stats.categories} supply categories` : "Awaiting database"}</div></div>}    </section>

    <section className="dash-grid">
      {sales ? <div className="panel">
        <div className="panel-head"><h2>Latest requests</h2><Link href="/admin/inquiries">View all</Link></div>
        {stats?.recent.length ? <div className="table-wrap"><table className="table" style={{ minWidth: 560 }}><thead><tr><th>Contact</th><th>Category</th><th>Status</th><th style={{ textAlign: "right" }}>Received</th></tr></thead><tbody>
          {stats.recent.map((item) => <tr key={item.id}><td><Link href={`/admin/inquiries?open=${item.id}`} className="primary">{item.name}</Link><span className="sub">{item.company}</span></td><td>{categories.find((c) => c.slug === item.category)?.name.en ?? item.category}</td><td><span className={`pill ${pill[item.status]}`}>{statusLabel[item.status]}</span></td><td className="num" style={{ textAlign: "right" }}>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Dubai" }).format(item.createdAt)}</td></tr>)}
        </tbody></table></div> : <div className="state"><span className="state-ico"><IconInbox size={24} /></span><h3>{stats ? "No requests yet" : "Inbox is waiting for the database"}</h3><p>{stats ? "New quotation requests from the website will land here." : "Once PostgreSQL is configured, every form submission appears here with its status."}</p></div>}
      </div> : <div className="panel">
        <div className="panel-head"><h2>Catalogue</h2><Link href="/admin/products">Open</Link></div>
        <div className="state"><span className="state-ico"><IconBox size={24} /></span><h3>{n(stats?.products)} products · {n(stats?.categories)} categories</h3><p>Publish, feature and order the supply catalogue shown on the website.</p></div>
      </div>}

      <div style={{ display: "grid", gap: 16 }}>
        <div className="panel">
          <div className="panel-head"><h2>Shortcuts</h2></div>
          <div className="panel-body quick" style={{ padding: 10 }}>
            {sales && <Link href="/admin/inquiries"><span className="q-ico"><IconInbox /></span><span><strong>Quotation inbox</strong><small>Reply, assign status and keep notes</small></span><IconChevron className="chev" /></Link>}
            {content && <Link href="/admin/products"><span className="q-ico"><IconBox /></span><span><strong>Products</strong><small>Publish and feature supply areas</small></span><IconChevron className="chev" /></Link>}
            {content && <Link href="/admin/categories"><span className="q-ico"><IconLayers /></span><span><strong>Categories</strong><small>Order the six supply families</small></span><IconChevron className="chev" /></Link>}
            {content && <Link href="/admin/media"><span className="q-ico"><IconImage /></span><span><strong>Media library</strong><small>Upload approved photography</small></span><IconChevron className="chev" /></Link>}
            {role === "SuperAdmin" && <Link href="/admin/users"><span className="q-ico"><IconUsers /></span><span><strong>Team & access</strong><small>Invite editors and sales staff</small></span><IconChevron className="chev" /></Link>}
            {role === "SuperAdmin" && <Link href="/admin/settings"><span className="q-ico"><IconSettings /></span><span><strong>Site settings</strong><small>Phone, WhatsApp, address and map</small></span><IconChevron className="chev" /></Link>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>System</h2></div>
          <div className="panel-body health"><ul>
            <li><span>Database</span><span className={`pill ${databaseConfigured() ? "pill-live" : "pill-new"}`}>{databaseConfigured() ? "Configured" : "Not configured"}</span></li>
            <li><span>Media storage</span><span className={`pill ${process.env.BLOB_READ_WRITE_TOKEN ? "pill-live" : "pill-draft"}`}>{process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob ready" : "Token missing"}</span></li>
            <li><span>Active team members</span><span className="num mono">{n(stats?.users)}</span></li>
          </ul></div>
        </div>
      </div>
    </section>
  </>;
}
