import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    const profs = await prisma.prof.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(profs);
  } catch (error) {
    console.error("Profs fetch error:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement des professeurs" 
    }, { status: 500 });
  }
}