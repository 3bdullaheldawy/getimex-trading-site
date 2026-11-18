import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, databaseConfigured } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : "getimex-local-development-secret-change-me"),
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (!databaseConfigured()) return null;
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const user = await prisma.adminUser.findUnique({ where: { email } });
      if (!user?.isActive || !(await bcrypt.compare(password, user.passwordHash))) return null;
      await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  })],
});
