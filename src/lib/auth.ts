// src/lib/auth.ts
import { prisma } from "@/db/prisma";
import { cookies as nextCookies } from "next/headers"; // <-- alias + async
import crypto from "crypto";

const COOKIE = "mu_session";
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export function hash(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function createSessionForProf(profId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ONE_WEEK);
  await prisma.session.create({ data: { token, profId, expiresAt: expires } });

  const jar = await nextCookies(); // <-- IMPORTANT
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
    expires,
  });
}

export async function createSessionForAdmin(adminId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ONE_WEEK);
  await prisma.session.create({ data: { token, adminId, expiresAt: expires } });

  const jar = await nextCookies(); // <-- IMPORTANT
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
    expires,
  });
}

export async function getCurrentUser() {
  const jar = await nextCookies(); // <-- IMPORTANT
  const token = jar.get(COOKIE)?.value;
  if (!token) return { role: "anon" as const };

  const s = await prisma.session.findUnique({
    where: { token },
    include: { prof: true, admin: true },
  });

  if (!s || s.expiresAt < new Date()) return { role: "anon" as const };
  if (s.admin) return { role: "admin" as const, admin: s.admin };
  if (s.prof)  return { role: "prof"  as const,  prof: s.prof };
  return { role: "anon" as const };
}

export async function logout() {
  const jar = await nextCookies(); // <-- IMPORTANT
  const token = jar.get(COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(COOKIE); // <-- IMPORTANT
}