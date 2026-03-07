import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Returns author-facing AI evaluation data for an application.
// Verified by email match (no auth token required).
// Does NOT expose commission analysis or verdict judgment.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "");
  const email = searchParams.get("email") || "";

  if (isNaN(id) || !email) {
    return NextResponse.json({ error: "Требуются id и email" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      applicantEmail: true,
      scoreBusiness: true,
      scoreInnovation: true,
      scoreFeasibility: true,
      scoreScalability: true,
      scoreQuality: true,
      aiEvaluations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          totalScore: true,
          authorStrengths: true,
          developmentSteps: true,
          resourcesForStart: true,
          questionsToThink: true,
          createdAt: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  if (application.applicantEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Email не совпадает" }, { status: 403 });
  }

  const eval_ = application.aiEvaluations[0];

  return NextResponse.json({
    scores: {
      business: application.scoreBusiness,
      innovation: application.scoreInnovation,
      feasibility: application.scoreFeasibility,
      scalability: application.scoreScalability,
      quality: application.scoreQuality,
      total: eval_?.totalScore ?? null,
    },
    authorStrengths: eval_ ? JSON.parse(eval_.authorStrengths) : [],
    developmentSteps: eval_ ? JSON.parse(eval_.developmentSteps) : [],
    resourcesForStart: eval_ ? JSON.parse(eval_.resourcesForStart) : [],
    questionsToThink: eval_ ? JSON.parse(eval_.questionsToThink) : [],
    evaluatedAt: eval_?.createdAt ?? null,
  });
}
