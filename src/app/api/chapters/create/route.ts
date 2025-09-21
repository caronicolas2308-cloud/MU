// src/app/api/chapters/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/chapters/create { classId, title }
export async function POST(req: Request) {
  const u = await getCurrentUser();
  if (u.role !== "prof") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { classId, title } = await req.json().catch(() => ({}));
  const cid = Number(classId);
  if (!cid || !title || typeof title !== "string") {
    return NextResponse.json({ error: "classId et title requis" }, { status: 400 });
  }

  const cls = await prisma.class.findFirst({ where: { id: cid, profId: u.prof!.id }, include: { chapters: true } });
  if (!cls) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  const nextNumber = (cls.chapters?.length ?? 0) > 0 ? Math.max(...cls.chapters.map(c => c.number)) + 1 : 3;

  const created = await prisma.chapter.create({
    data: { classId: cid, number: nextNumber, title: title.trim() },
  });

  return NextResponse.json({ ok: true, chapter: created }, { status: 201 });
}