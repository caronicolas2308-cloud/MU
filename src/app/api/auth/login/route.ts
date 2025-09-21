import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hash, createSessionForAdmin, createSessionForProf } from "@/lib/auth";

export async function POST(req: Request) {
  const { identifier, password } = await req.json().catch(() => ({}));
  if (!identifier || !password) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }
  const h = hash(password);

  // ADMIN: par NOM uniquement
  const admin = await prisma.admin.findFirst({ where: { name: identifier } });
  if (admin && admin.passwordHash === h) {
    await createSessionForAdmin(admin.id);
    return NextResponse.json({ ok: true, role: "admin" });
  }

  // PROF: par NOM
  const prof = await prisma.prof.findUnique({ where: { name: identifier } });
  if (prof && prof.passwordHash === h) {
    await createSessionForProf(prof.id);
    return NextResponse.json({ ok: true, role: "prof" });
  }

  return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
}