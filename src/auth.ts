import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/request-ip";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;
const SESSION_MAX_AGE_SECONDS = 30 * 60; // sesión admin corta: 30 min

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 5 * 60,
  },
  pages: {
    signIn: "/admin/login",
  },
  cookies: {
    // httpOnly + secure ya son el default de Auth.js; sameSite: "strict" se
    // pide explícitamente para la cookie de sesión del panel admin (más
    // estricto que el "lax" por defecto).
    sessionToken: {
      options: { sameSite: "strict" },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo" },
        password: { label: "Contraseña" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const ip = getClientIp(request.headers);

        const user = await prisma.adminUser.findUnique({ where: { email } });

        if (!user || !user.isActive) {
          await logAudit({
            action: "LOGIN_FAILED",
            entityType: "AdminUser",
            entityId: user?.id ?? null,
            ipAddress: ip,
            changes: { email },
          });
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logAudit({
            action: "LOGIN_FAILED",
            entityType: "AdminUser",
            entityId: user.id,
            ipAddress: ip,
            changes: { reason: "locked" },
          });
          return null;
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordValid) {
          const attempts = user.failedLoginAttempts + 1;
          const shouldLock = attempts >= LOCKOUT_THRESHOLD;
          await prisma.adminUser.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: shouldLock ? 0 : attempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                : null,
            },
          });
          await logAudit({
            action: "LOGIN_FAILED",
            entityType: "AdminUser",
            entityId: user.id,
            ipAddress: ip,
            changes: shouldLock ? { reason: "locked_now" } : undefined,
          });
          return null;
        }

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        });
        await logAudit({
          action: "LOGIN",
          entityType: "AdminUser",
          entityId: user.id,
          adminUserId: user.id,
          ipAddress: ip,
        });

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "EDITOR";
      }
      return session;
    },
  },
});
