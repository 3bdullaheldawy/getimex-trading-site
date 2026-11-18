import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : "getimex-local-development-secret-change-me"),
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "SuperAdmin" | "ContentEditor" | "SalesInbox" | undefined;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
