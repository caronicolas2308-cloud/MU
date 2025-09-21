import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();
  if (u.role !== "admin") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const profs = await prisma.prof.findMany({
    orderBy: { name: "asc" },
    include: { classes: { orderBy: { id: "asc" } } },
  });

  const settings = await prisma.setting.findFirst();

  return NextResponse.json({ profs, settings, admin: u.admin });
}