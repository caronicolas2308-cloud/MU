import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hash } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);
    const password = request.nextUrl.searchParams.get("password");

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        chapter: {
          include: {
            class: {
              include: {
                prof: true
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    // Vérifier la protection par mot de passe
    if (document.isProtected) {
      if (!password) {
        return NextResponse.json({ 
          error: "Mot de passe requis",
          requiresPassword: true 
        }, { status: 401 });
      }

      if (document.passwordHash !== hash(password)) {
        return NextResponse.json({ 
          error: "Mot de passe incorrect" 
        }, { status: 401 });
      }
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      type: document.type,
      blobUrl: document.blobUrl,
      isProtected: document.isProtected,
      chapter: {
        title: document.chapter.title,
        number: document.chapter.number,
        class: {
          name: document.chapter.class.name,
          prof: {
            name: document.chapter.class.prof.name
          }
        }
      }
    });

  } catch (error) {
    console.error("Document fetch error:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement du document" 
    }, { status: 500 });
  }
}
