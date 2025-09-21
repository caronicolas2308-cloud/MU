import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser();
  if (u.role !== "admin") return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const id = Number(params.id);
  const { name } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  await prisma.class.update({ where: { id }, data: { name: String(name).trim() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser();
  if (u.role !== "admin") return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const id = Number(params.id);
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}