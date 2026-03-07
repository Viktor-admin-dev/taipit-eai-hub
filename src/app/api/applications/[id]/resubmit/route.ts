import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Applicant can update their own application content (verified by email match)
// This triggers re-evaluation in background
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const applicationId = parseInt(id);

  if (isNaN(applicationId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { applicantEmail, title, descriptionProblem, descriptionSolution, expectedEffect, resourcesNeeded } = body;

  if (!applicantEmail) {
    return NextResponse.json({ error: "Email обязателен для проверки" }, { status: 400 });
  }

  if (!title || !descriptionProblem || !descriptionSolution || !expectedEffect) {
    return NextResponse.json({ error: "Не все обязательные поля заполнены" }, { status: 400 });
  }

  if (descriptionProblem.length < 100 || descriptionSolution.length < 100) {
    return NextResponse.json({ error: "Описание должно содержать минимум 100 символов" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  // Verify ownership by email (case-insensitive)
  if (application.applicantEmail.toLowerCase() !== applicantEmail.toLowerCase()) {
    return NextResponse.json({ error: "Email не совпадает с заявкой" }, { status: 403 });
  }

  // Update application content
  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      title,
      descriptionProblem,
      descriptionSolution,
      expectedEffect,
      resourcesNeeded: resourcesNeeded || null,
    },
    include: { division: true, teamMembers: true },
  });

  // Run AI re-evaluation in background
  if (process.env.ANTHROPIC_API_KEY) {
    import("@/lib/evaluation-prompt").then(({ buildEvaluationPrompt }) =>
      import("@anthropic-ai/sdk").then(({ default: Anthropic }) =>
        import("@/lib/prisma").then(async ({ default: prismaClient }) => {
          try {
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
            const prompt = buildEvaluationPrompt(updated);
            const message = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 2500,
              messages: [{ role: "user", content: prompt }],
            });
            const text = message.content[0].type === "text" ? message.content[0].text : "";
            const parsed = JSON.parse(text);
            const scores = parsed.scores;
            const forAuthor = parsed.forAuthor || {};
            const forCommission = parsed.forCommission || {};
            const legacy = parsed.legacy || {};

            await prismaClient.aIEvaluation.create({
              data: {
                applicationId,
                scoreBusiness: scores.business,
                scoreInnovation: scores.innovation,
                scoreFeasibility: scores.feasibility,
                scoreScalability: scores.scalability,
                scoreQuality: scores.quality,
                totalScore: scores.total,
                verdict: parsed.verdict,
                oneLiner: parsed.oneLiner || "",
                authorStrengths: JSON.stringify(forAuthor.strengths || []),
                developmentSteps: JSON.stringify(forAuthor.developmentSteps || []),
                resourcesForStart: JSON.stringify(forAuthor.resources || []),
                questionsToThink: JSON.stringify(forAuthor.questions || []),
                authorAiLevel: forCommission.authorProfile?.aiLevel || "growing",
                authorQualities: JSON.stringify(forCommission.authorProfile?.qualities || []),
                authorGrowthZone: forCommission.authorProfile?.growthZone || "",
                problemSimple: forCommission.ideaSimplified?.problem || "",
                solutionSimple: forCommission.ideaSimplified?.solution || "",
                businessEffect: forCommission.ideaSimplified?.businessEffect || "",
                hiddenPotential: forCommission.hiddenPotential?.whatAuthorMissed || "",
                growthPath: forCommission.hiddenPotential?.growthPath || "",
                synergies: JSON.stringify(forCommission.hiddenPotential?.synergies || []),
                mentorshipNeeded: forCommission.support?.mentorshipType || "",
                suggestedMentor: forCommission.support?.suggestedMentor || "",
                resourcesToAllocate: JSON.stringify(forCommission.support?.resourcesToAllocate || []),
                summary: legacy.summary || "",
                strengths: JSON.stringify(legacy.strengths || []),
                weaknesses: JSON.stringify(legacy.weaknesses || []),
                recommendations: JSON.stringify(legacy.recommendations || []),
                modelUsed: "claude-sonnet-4-20250514",
                promptTokens: message.usage.input_tokens,
                completionTokens: message.usage.output_tokens,
              },
            });

            await prismaClient.application.update({
              where: { id: applicationId },
              data: {
                scoreBusiness: scores.business,
                scoreInnovation: scores.innovation,
                scoreFeasibility: scores.feasibility,
                scoreScalability: scores.scalability,
                scoreQuality: scores.quality,
                expertComments: legacy.summary,
              },
            });
          } catch (err) {
            console.error("Resubmit re-evaluation error:", err);
          }
        })
      )
    ).catch(console.error);
  }

  return NextResponse.json({ ok: true, id: updated.id });
}
