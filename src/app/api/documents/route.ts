// src/app/api/documents/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  if (!chapterId) {
    return NextResponse.json({ error: "chapterId manquant" }, { status: 400 });
  }

  const docs = await prisma.document.findMany({
    where: { chapterId: Number(chapterId) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}