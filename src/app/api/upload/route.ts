import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hash } from "@/lib/auth";
import { put } from "@vercel/blob";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

// Fonction pour compter le nombre de pages d'un PDF
async function getPdfPageCount(file: File): Promise<number> {
  try {
    // Pour l'instant, on retourne une estimation basée sur la taille du fichier
    // En production, vous pourriez utiliser une bibliothèque comme pdf-parse
    const fileSizeKB = file.size / 1024;
    const estimatedPages = Math.max(1, Math.min(10, Math.ceil(fileSizeKB / 50))); // Estimation: ~50KB par page
    
    // Vérification basique que c'est bien un PDF
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfHeader = uint8Array.slice(0, 4);
    const isPdf = pdfHeader[0] === 0x25 && pdfHeader[1] === 0x50 && pdfHeader[2] === 0x44 && pdfHeader[3] === 0x46; // %PDF
    
    if (!isPdf) {
      throw new Error("Le fichier n'est pas un PDF valide");
    }
    
    return estimatedPages;
  } catch (error) {
    console.error("Erreur lors du comptage des pages:", error);
    throw new Error("Impossible de lire le PDF");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "prof") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const classId = parseInt(formData.get("classId") as string);
    const chapterId = parseInt(formData.get("chapterId") as string);
    const type = formData.get("type") as string;
    const isProtected = formData.get("isProtected") === "true";
    const password = formData.get("password") as string;

    if (!file || !classId || !chapterId || !type) {
      return NextResponse.json({ 
        error: "Fichier, classe, chapitre et type requis" 
      }, { status: 400 });
    }

    // Vérifier que la classe appartient au prof
    const classData = await prisma.class.findFirst({
      where: { 
        id: classId,
        profId: user.prof!.id 
      },
      include: {
        chapters: {
          where: { id: chapterId }
        }
      }
    });

    if (!classData || classData.chapters.length === 0) {
      return NextResponse.json({ 
        error: "Classe ou chapitre non trouvé" 
      }, { status: 404 });
    }

    // Vérifier le format PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ 
        error: "Seuls les fichiers PDF sont acceptés" 
      }, { status: 400 });
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Fichier trop volumineux (max 10MB)" 
      }, { status: 400 });
    }

    // Vérifier le type de document (rubriques SERENA)
    const validTypes = ["cours", "exos", "corr_exos", "controle", "corr_controle"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Type de document invalide. Types autorisés: ${validTypes.join(", ")}` 
      }, { status: 400 });
    }

    // Vérifier le nombre de pages (max 10)
    const pageCount = await getPdfPageCount(file);
    if (pageCount > 10) {
      return NextResponse.json({ 
        error: `Le PDF contient ${pageCount} pages. Maximum 10 pages autorisées.` 
      }, { status: 400 });
    }

    // Upload vers Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Créer le document en base
    const document = await prisma.document.create({
      data: {
        chapterId,
        type: type as any,
        title: file.name.replace('.pdf', ''),
        blobUrl: blob.url,
        fileSize: file.size,
        isProtected,
        passwordHash: isProtected && password ? hash(password) : null,
      }
    });

    return NextResponse.json({ 
      success: true,
      documentId: document.id,
      pages: pageCount,
      message: "Document uploadé avec succès"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: `Erreur lors de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}