import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { databaseConfigured, prisma } from "@/lib/db";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "CMS", robots: { index: false, follow: false } };

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const role = session.user.role;
  let newInquiries = 0;
  if (databaseConfigured() && (role === "SuperAdmin" || role === "SalesInbox")) {
    newInquiries = await prisma.inquiry.count({ where: { status: "New" } }).catch(() => 0);
  }
  return <AdminChrome user={{ name: session.user.name ?? "Team member", email: session.user.email ?? "", role }} dbReady={databaseConfigured()} newInquiries={newInquiries}>{children}</AdminChrome>;
}
