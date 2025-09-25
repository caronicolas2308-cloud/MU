// src/app/api/class/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/class/:id  -> détail + chapitres
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (user.role !== "prof") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  const klass = await prisma.class.findFirst({
    where: { id, profId: user.prof!.id },
    include: { chapters: { orderBy: { number: "asc" } } },
  });
  if (!klass) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(klass);
}

// PATCH /api/class/:id  -> renommer la classe
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Form fallback: on passe _method=PATCH via form
  const url = new URL(req.url);
  const methodOverride = url.searchParams.get("_method");
  if (methodOverride !== "PATCH") {
    const form = await req.formData().catch(() => null);
    if (form?.get("_method") !== "PATCH") {
      return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
    }
  }

  const user = await getCurrentUser();
  if (user.role !== "prof") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  const body = await req.formData();
  const name = String(body.get("name") || "").trim();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const exists = await prisma.class.findFirst({ where: { id, profId: user.prof!.id } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.class.update({ where: { id }, data: { name } });
  return NextResponse.redirect(new URL(`/class/${id}`, req.url));
}

// DELETE /api/class/:id  -> supprimer la classe
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (user.role !== "prof") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  
  // Vérifier que la classe appartient au prof
  const exists = await prisma.class.findFirst({ where: { id, profId: user.prof!.id } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Supprimer la classe (cascade supprimera les chapitres et documents)
  await prisma.class.delete({ where: { id } });
  
  return NextResponse.json({ success: true, message: "Classe supprimée avec succès" });
}