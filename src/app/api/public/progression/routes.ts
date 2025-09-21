import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = Number(searchParams.get("classId") ?? "");
  if (!classId) return NextResponse.json({ chapters: [] });

  const chapters = await prisma.chapter.findMany({
    where: { classId },
    orderBy: { number: "asc" },
    include: {
      documents: {
        select: {
          id: true,
          type: true,
          title: true,
          isProtected: true,
        },
        orderBy: { id: "asc" },
      },
    },
  });

  return NextResponse.json({ chapters });
}