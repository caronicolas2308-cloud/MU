import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const profId = request.nextUrl.searchParams.get("profId");
    
    if (!profId) {
      return NextResponse.json({ error: "profId requis" }, { status: 400 });
    }

    const profIdNumber = parseInt(profId);
    if (isNaN(profIdNumber)) {
      return NextResponse.json({ error: "profId doit être un nombre" }, { status: 400 });
    }

    const classes = await prisma.class.findMany({
      where: { profId: profIdNumber },
      select: {
        id: true,
        name: true,
        chapters: {
          select: {
            id: true,
            number: true,
            title: true,
          },
          orderBy: { number: "asc" }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Classes fetch error:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement des classes" 
    }, { status: 500 });
  }
}