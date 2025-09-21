import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser, hash } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();
  if (u.role !== "admin") return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const settings = await prisma.setting.findFirst();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const u = await getCurrentUser();
  if (u.role !== "admin") return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.maxProfs === "number") data.maxProfs = body.maxProfs;
  if (typeof body.maxClassesPerProf === "number") data.maxClassesPerProf = body.maxClassesPerProf;
  if (typeof body.signupSesame === "string" && body.signupSesame.trim()) {
    data.signupSesameHash = hash(body.signupSesame.trim());
  }
  const settings = await prisma.setting.upsert({
    where: { id: 1 },
    update: data,
    create: {
      signupSesameHash: data.signupSesameHash ?? hash("prof-sesame"),
      maxProfs: data.maxProfs ?? 10,
      maxClassesPerProf: data.maxClassesPerProf ?? 10,
    },
  });
  return NextResponse.json(settings);
}