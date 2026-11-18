import type { AdminRole } from "@prisma/client";
import { auth } from "@/auth";

export type Permission = "content" | "sales" | "settings" | "users";

const permissions: Record<AdminRole, Permission[]> = {
  SuperAdmin: ["content", "sales", "settings", "users"],
  ContentEditor: ["content"],
  SalesInbox: ["sales"],
};

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) throw new Error("UNAUTHORIZED");
  if (!permissions[session.user.role].includes(permission)) throw new Error("FORBIDDEN");
  return session.user;
}

export async function getAdminUser() {
  const session = await auth();
  return session?.user ?? null;
}
