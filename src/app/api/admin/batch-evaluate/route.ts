import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { buildEvaluationPrompt } from "@/lib/evaluation-prompt";
import { sendToTelegramGroup } from "@/lib/telegram";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/admin/batch-evaluate
// Evaluates all applications that don't have an AIEvaluation yet
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // Find applications without any AI evaluation
  const evaluated = await prisma.aIEvaluation.findMany({ select: { applicationId: true } });
  const evaluatedIds = new Set(evaluated.map((e) => e.applicationId));

  const applications = await prisma.application.findMany({
    include: { division: true, teamMembers: true },
    orderBy: { id: "asc" },
  });

  const toEvaluate = applications.filter((a) => !evaluatedIds.has(a.id));

  if (toEvaluate.length === 0) {
    return NextResponse.json({ message: "All applications already evaluated", count: 0 });
  }

  // Run in background, return immediately
  const run = async () => {
    const results: { id: number; ok: boolean; error?: string }[] = [];

    for (const application of toEvaluate) {
      try {
        const prompt = buildEvaluationPrompt(application);
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }],
        });

        const text = message.content[0].type === "text" ? message.content[0].text : "";
        const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const parsed = JSON.parse(jsonText);
        const scores = parsed.scores;
        const forAuthor = parsed.forAuthor || {};
        const forCommission = parsed.forCommission || {};
        const legacy = parsed.legacy || {};

        const aiEval = await prisma.aIEvaluation.create({
          data: {
            applicationId: application.id,
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

        await prisma.application.update({
          where: { id: application.id },
          data: {
            scoreBusiness: scores.business,
            scoreInnovation: scores.innovation,
            scoreFeasibility: scores.feasibility,
            scoreScalability: scores.scalability,
            scoreQuality: scores.quality,
            expertComments: legacy.summary,
          },
        });

        // Send to Telegram
        sendToTelegramGroup(aiEval, application).catch(console.error);

        results.push({ id: application.id, ok: true });
        console.log(`Batch eval OK: application #${application.id}`);

        // Rate limiting — pause between calls
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Batch eval FAIL: application #${application.id}`, err);
        results.push({ id: application.id, ok: false, error: String(err) });
      }
    }

    console.log("Batch evaluation complete:", results);
  };

  run().catch(console.error);

  return NextResponse.json({
    message: `Started batch evaluation for ${toEvaluate.length} applications`,
    applicationIds: toEvaluate.map((a) => a.id),
  });
}
