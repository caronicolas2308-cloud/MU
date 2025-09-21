import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = Number(searchParams.get("classId") ?? "");
  if (!classId) return NextResponse.json({ error: "classId manquant" }, { status: 400 });

  const u = await getCurrentUser();

  if (u.role === "prof") {
    const owned = await prisma.class.findFirst({
      where: { id: classId, profId: u.prof!.id },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  } else if (u.role === "anon") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const chapters = await prisma.chapter.findMany({
    where: { classId },
    orderBy: { number: "asc" },
  });
  return NextResponse.json(chapters);
}