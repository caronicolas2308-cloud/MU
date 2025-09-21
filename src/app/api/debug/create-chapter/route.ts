import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  try {
    const { className, chapterNumber, chapterTitle } = await req.json();
    
    if (!className || !chapterNumber || !chapterTitle) {
      return NextResponse.json({ 
        error: "className, chapterNumber et chapterTitle requis" 
      }, { status: 400 });
    }

    // Trouver la classe par nom
    const classData = await prisma.class.findFirst({
      where: { name: className },
      include: {
        prof: {
          select: { name: true }
        }
      }
    });

    if (!classData) {
      return NextResponse.json({ 
        error: `Classe '${className}' non trouvée` 
      }, { status: 404 });
    }

    // Créer le chapitre
    const newChapter = await prisma.chapter.create({
      data: {
        classId: classData.id,
        number: parseInt(chapterNumber),
        title: chapterTitle
      },
      include: {
        class: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      chapter: newChapter,
      message: `Chapitre ${chapterNumber} '${chapterTitle}' créé pour la classe '${className}'`
    });

  } catch (error) {
    console.error("Erreur création chapitre:", error);
    return NextResponse.json({ 
      error: `Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
