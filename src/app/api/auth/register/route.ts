import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hash, createSessionForProf } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, password, sesame } = await req.json().catch(() => ({}));
  if (!name || !password || !sesame) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  const setting = await prisma.setting.findFirst();
  if (!setting) {
    return NextResponse.json({ error: "Configuration manquante (seed)" }, { status: 500 });
  }

  if (hash(String(sesame).trim()) !== setting.signupSesameHash) {
    return NextResponse.json({ error: "Sésame invalide" }, { status: 403 });
  }

  // Vérifier la limite de profs
  const profCount = await prisma.prof.count();
  if (profCount >= setting.maxProfs) {
    return NextResponse.json({ 
      error: `Limite de ${setting.maxProfs} professeurs atteinte. Contactez l'administrateur.` 
    }, { status: 403 });
  }

  // Nom unique
  const exists = await prisma.prof.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "Nom déjà utilisé" }, { status: 409 });
  }

  const created = await prisma.prof.create({
    data: { name, passwordHash: hash(password) },
  });

  await createSessionForProf(created.id);
  return NextResponse.json({ ok: true });
}