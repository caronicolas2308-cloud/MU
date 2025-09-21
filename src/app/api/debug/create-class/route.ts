import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  try {
    const { profName, className } = await req.json();
    
    if (!profName || !className) {
      return NextResponse.json({ 
        error: "profName et className requis" 
      }, { status: 400 });
    }

    // Trouver le prof par nom
    const prof = await prisma.prof.findUnique({
      where: { name: profName }
    });

    if (!prof) {
      return NextResponse.json({ 
        error: `Professeur '${profName}' non trouvé` 
      }, { status: 404 });
    }

    // Créer la classe
    const newClass = await prisma.class.create({
      data: {
        name: className,
        profId: prof.id
      },
      include: {
        prof: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      class: newClass,
      message: `Classe '${className}' créée pour le professeur '${profName}'`
    });

  } catch (error) {
    console.error("Erreur création classe:", error);
    return NextResponse.json({ 
      error: `Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
