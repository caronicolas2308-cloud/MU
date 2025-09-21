// src/app/api/class/[id]/chapters/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;            // Next 15: params est une Promise
  const classId = Number(id);

  const user = await getCurrentUser();
  if (user.role !== "prof") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // La classe doit appartenir au prof
  const klass = await prisma.class.findFirst({
    where: { id: classId, profId: user.prof!.id },
    include: { chapters: { select: { number: true }, orderBy: { number: "desc" } } },
  });
  if (!klass) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await req.formData();
  const title = (form.get("title") || "").toString().trim();
  if (!title) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }

  const nextNumber = (klass.chapters[0]?.number ?? 0) + 1;

  await prisma.chapter.create({
    data: { classId, number: nextNumber, title },
  });

  return NextResponse.redirect(new URL(`/class/${classId}`, req.url));
}