import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hash, createSessionForProf } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, password, sesame } = await req.json().catch(() => ({}));
    if (!name || !password || !sesame) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }

    const setting = await prisma.setting.findFirst();
    if (!setting) {
      return NextResponse.json({ error: "Configuration manquante (seed)" }, { status: 500 });
    }

    const okSesame = hash(String(sesame).trim()) === setting.signupSesameHash;
    if (!okSesame) {
      return NextResponse.json({ error: "Sésame invalide" }, { status: 403 });
    }

    const exists = await prisma.prof.findUnique({ where: { name } });
    if (exists) {
      return NextResponse.json({ error: "Nom déjà utilisé" }, { status: 409 });
    }

    const created = await prisma.prof.create({
      data: { name: String(name).trim(), passwordHash: hash(password) },
    });

    await createSessionForProf(created.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("REGISTER_ROUTE_ERROR:", err);
    // Toujours renvoyer une réponse JSON (évite le “Failed to fetch”)
    return NextResponse.json({ error: "Erreur serveur (register)" }, { status: 500 });
  }
}