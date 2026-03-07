import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.newsPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      body: true,
      cta: true,
      createdAt: true,
    },
  });

  const [totalApplications, totalParticipants] = await Promise.all([
    prisma.application.count(),
    prisma.application.groupBy({ by: ["applicantEmail"] }).then((r) => r.length),
  ]);

  const contestEnd = new Date("2026-03-31");
  const daysLeft = Math.max(
    0,
    Math.ceil((contestEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return NextResponse.json({ posts, totalApplications, totalParticipants, daysLeft });
}
