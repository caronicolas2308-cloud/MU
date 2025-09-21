import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hash } from "@/lib/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);
    const password = request.nextUrl.searchParams.get("password");

    // Récupérer le document avec toutes les relations nécessaires
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

    // Télécharger le PDF depuis Vercel Blob
    const pdfResponse = await fetch(document.blobUrl);
    if (!pdfResponse.ok) {
      throw new Error("Impossible de télécharger le PDF depuis le stockage");
    }

    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Créer un pied de page avec les informations du document
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    // Informations pour le pied de page
    const footerText = `${document.chapter.class.prof.name} - ${document.chapter.class.name} - Chapitre ${document.chapter.number}: ${document.chapter.title} - ${document.title}`;
    const currentDate = new Date().toLocaleDateString('fr-FR');

    // Ajouter le pied de page à chaque page
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      
      // Dessiner le pied de page
      page.drawText(footerText, {
        x: 50,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Ajouter la date et le numéro de page
      page.drawText(`Téléchargé le ${currentDate} - Page ${index + 1}/${pages.length}`, {
        x: width - 200,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Ligne de séparation
      page.drawLine({
        start: { x: 50, y: 45 },
        end: { x: width - 50, y: 45 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
    });

    // Générer le PDF modifié
    const modifiedPdfBytes = await pdfDoc.save();

    // Retourner le PDF en téléchargement
    return new NextResponse(modifiedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.title}_avec_pied_de_page.pdf"`,
        'Content-Length': modifiedPdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error("Document download error:", error);
    return NextResponse.json({ 
      error: "Erreur lors du téléchargement du document" 
    }, { status: 500 });
  }
}
