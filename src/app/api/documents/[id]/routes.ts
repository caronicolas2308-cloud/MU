import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, title: true, blobUrl: true, isProtected: true },
  });
  if (!doc) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Si protégé, ne renvoie pas l'URL tant que pas déverrouillé
  if (doc.isProtected) {
    return NextResponse.json({ id: doc.id, title: doc.title, isProtected: true });
  }
  return NextResponse.json(doc);
}