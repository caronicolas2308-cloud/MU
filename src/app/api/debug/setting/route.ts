import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const s = await prisma.setting.findFirst();
  return NextResponse.json({ hasSetting: !!s });
}