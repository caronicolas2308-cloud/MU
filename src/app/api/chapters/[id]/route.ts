// src/app/api/chapters/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH /api/chapters/:id { title }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser();
  if (u.role !== "prof") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const id = Number(params.id);
  const { title } = await req.json().catch(() => ({}));
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title requis" }, { status: 400 });
  }

  const ch = await prisma.chapter.findUnique({ where: { id }, include: { class: true } });
  if (!ch || ch.class.profId !== u.prof!.id) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  await prisma.chapter.update({ where: { id }, data: { title: title.trim() } });
  return NextResponse.json({ ok: true });
}

// DELETE /api/chapters/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser();
  if (u.role !== "prof") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const id = Number(params.id);
  const ch = await prisma.chapter.findUnique({ where: { id }, include: { class: true } });
  if (!ch || ch.class.profId !== u.prof!.id) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  if (ch.number <= 2) {
    return NextResponse.json({ error: "Chapitres 1 et 2 indestructibles" }, { status: 400 });
  }

  await prisma.chapter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}