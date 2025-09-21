import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  const u = await getCurrentUser();
  if (u.role !== "admin") return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const { name } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  await prisma.admin.update({ where: { id: u.admin!.id }, data: { name: name.trim() } });
  return NextResponse.json({ ok: true });
}
