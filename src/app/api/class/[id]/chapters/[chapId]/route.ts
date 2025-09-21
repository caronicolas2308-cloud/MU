// src/app/api/class/[id]/chapters/[chapId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH via form POST + _method=PATCH
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; chapId: string }> }
) {
  const { id, chapId } = await ctx.params;
  const classId = Number(id);
  const chapterId = Number(chapId);

  const url = new URL(req.url);
  const methodOverride = url.searchParams.get("_method");

  if (methodOverride === "DELETE") {
    return DELETE(req, ctx);
  }

  // Sinon on traite comme PATCH (via form)
  const user = await getCurrentUser();
  if (user.role !== "prof") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }

  const ch = await prisma.chapter.findFirst({
    where: { id: chapterId, classId, class: { profId: user.prof!.id } },
  });
  if (!ch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.chapter.update({ where: { id: chapterId }, data: { title } });

  return NextResponse.redirect(new URL(`/class/${classId}`, req.url));
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string; chapId: string }> }
) {
  const { id, chapId } = await ctx.params;
  const classId = Number(id);
  const chapterId = Number(chapId);

  const user = await getCurrentUser();
  if (user.role !== "prof") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ch = await prisma.chapter.findFirst({
    where: { id: chapterId, classId, class: { profId: user.prof!.id } },
  });
  if (!ch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (ch.number < 3) {
    return NextResponse.json(
      { error: "Les chapitres 1 et 2 sont indestructibles." },
      { status: 400 }
    );
  }

  await prisma.document.deleteMany({ where: { chapterId } });
  await prisma.chapter.delete({ where: { id: chapterId } });

  return NextResponse.redirect(new URL(`/class/${classId}`, req.url));
}