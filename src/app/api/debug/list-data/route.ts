import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    const profs = await prisma.prof.findMany({
      select: {
        id: true,
        name: true,
        classes: {
          select: {
            id: true,
            name: true,
            chapters: {
              select: {
                id: true,
                number: true,
                title: true
              },
              orderBy: { number: "asc" }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ 
      success: true,
      data: profs
    });

  } catch (error) {
    console.error("Erreur lecture données:", error);
    return NextResponse.json({ 
      error: `Erreur lors de la lecture: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
