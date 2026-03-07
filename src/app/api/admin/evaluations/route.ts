import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applicationId = parseInt(searchParams.get("applicationId") || "");

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const evaluations = await prisma.aIEvaluation.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(evaluations);
}
