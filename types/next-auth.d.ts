import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User { role?: "SuperAdmin" | "ContentEditor" | "SalesInbox"; }
  interface Session { user: User & { id: string; role?: "SuperAdmin" | "ContentEditor" | "SalesInbox" }; }
}

declare module "next-auth/jwt" {
  interface JWT { role?: "SuperAdmin" | "ContentEditor" | "SalesInbox"; }
}
