import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();

  if (u.role === "prof") {
    const classes = await prisma.class.findMany({
      where: { profId: u.prof!.id },
      orderBy: { id: "asc" },
      include: { chapters: true },
    });
    return NextResponse.json(classes);
  }

  if (u.role === "admin") {
    const classes = await prisma.class.findMany({
      orderBy: [{ profId: "asc" }, { id: "asc" }],
      include: { chapters: true, prof: true },
    });
    return NextResponse.json(classes);
  }

  return NextResponse.json([], { status: 200 });
}