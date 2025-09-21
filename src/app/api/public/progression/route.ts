import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get("classId");
    
    if (!classId) {
      return NextResponse.json({ error: "classId requis" }, { status: 400 });
    }

    const chapters = await prisma.chapter.findMany({
      where: { classId: parseInt(classId) },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            title: true,
            isProtected: true,
          }
        }
      },
      orderBy: { number: "asc" }
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("Progression fetch error:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement de la progression" 
    }, { status: 500 });
  }
}
