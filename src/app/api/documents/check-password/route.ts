// src/app/api/documents/check-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hash } from "@/lib/auth";

export async function POST(req: Request) {
  const { documentId, password } = await req.json();

  if (!documentId || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({ where: { id: Number(documentId) } });
  if (!doc) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  if (!doc.isProtected) return NextResponse.json({ ok: true, unlocked: true });

  const ok = doc.passwordHash === hash(password.trim());
  return NextResponse.json({ ok, unlocked: ok });
}