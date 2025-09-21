import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const a = await prisma.admin.findMany({ select: { id: true, name: true, createdAt: true } });
  return NextResponse.json(a);
}