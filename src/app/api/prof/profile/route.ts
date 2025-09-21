import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user.role !== "prof") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupère les classes du prof connecté
    const classes = await prisma.class.findMany({
      where: { profId: user.prof!.id },
      orderBy: { id: "asc" },
      include: {
        chapters: { orderBy: { number: "asc" } },
      },
    });

    return NextResponse.json({ 
      user: user.prof,
      classes 
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement du profil" 
    }, { status: 500 });
  }
}
