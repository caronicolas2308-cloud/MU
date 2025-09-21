import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hash } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "prof") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, chapters } = body;

    if (!name || !chapters || chapters.length < 2) {
      return NextResponse.json({ 
        error: "Nom de classe et au moins 2 chapitres requis" 
      }, { status: 400 });
    }

    // Vérifier la limite de classes par prof
    const settings = await prisma.setting.findFirst();
    const maxClasses = settings?.maxClassesPerProf || 10;
    
    const existingClasses = await prisma.class.count({
      where: { profId: user.prof!.id }
    });

    if (existingClasses >= maxClasses) {
      return NextResponse.json({ 
        error: `Limite de ${maxClasses} classes par professeur atteinte` 
      }, { status: 400 });
    }

    // Créer la classe avec les chapitres
    const newClass = await prisma.class.create({
      data: {
        name,
        profId: user.prof!.id,
        chapters: {
          create: chapters.map((chapter: any, index: number) => ({
            number: index + 1,
            title: chapter.title || `Chapitre ${index + 1}`,
          }))
        }
      },
      include: {
        chapters: {
          orderBy: { number: "asc" }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      classId: newClass.id,
      class: newClass 
    });

  } catch (error) {
    console.error("Class creation error:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la création de la classe" 
    }, { status: 500 });
  }
}