import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { buildEvaluationPrompt } from "@/lib/evaluation-prompt";
import { sendToTelegramGroup } from "@/lib/telegram";
import { generateAndSaveContent } from "@/lib/content-generator";
import { buildFileContentBlocks } from "@/lib/file-content";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { applicationId } = await request.json();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { division: true, teamMembers: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    const prompt = buildEvaluationPrompt(application);
    const fileBlocks = await buildFileContentBlocks(application.filesUrls);
    const userContent = fileBlocks.length > 0
      ? [{ type: "text" as const, text: prompt }, ...fileBlocks]
      : prompt;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: userContent }],
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
        applicationId,
        scoreBusiness: scores.business,
        scoreInnovation: scores.innovation,
        scoreFeasibility: scores.feasibility,
        scoreScalability: scores.scalability,
        scoreQuality: scores.quality,
        totalScore: scores.total,
        verdict: parsed.verdict,
        oneLiner: parsed.oneLiner || "",
        // For author
        authorStrengths: JSON.stringify(forAuthor.strengths || []),
        developmentSteps: JSON.stringify(forAuthor.developmentSteps || []),
        resourcesForStart: JSON.stringify(forAuthor.resources || []),
        questionsToThink: JSON.stringify(forAuthor.questions || []),
        // Author profile
        authorAiLevel: forCommission.authorProfile?.aiLevel || "growing",
        authorQualities: JSON.stringify(forCommission.authorProfile?.qualities || []),
        authorGrowthZone: forCommission.authorProfile?.growthZone || "",
        // Simplified idea
        problemSimple: forCommission.ideaSimplified?.problem || "",
        solutionSimple: forCommission.ideaSimplified?.solution || "",
        businessEffect: forCommission.ideaSimplified?.businessEffect || "",
        // Hidden potential
        hiddenPotential: forCommission.hiddenPotential?.whatAuthorMissed || "",
        growthPath: forCommission.hiddenPotential?.growthPath || "",
        synergies: JSON.stringify(forCommission.hiddenPotential?.synergies || []),
        // Support recommendations
        mentorshipNeeded: forCommission.support?.mentorshipType || "",
        suggestedMentor: forCommission.support?.suggestedMentor || "",
        resourcesToAllocate: JSON.stringify(forCommission.support?.resourcesToAllocate || []),
        // Legacy
        summary: legacy.summary || "",
        strengths: JSON.stringify(legacy.strengths || []),
        weaknesses: JSON.stringify(legacy.weaknesses || []),
        recommendations: JSON.stringify(legacy.recommendations || []),
        // Meta
        modelUsed: "claude-sonnet-4-20250514",
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
      },
    });

    // Update Application scores
    await prisma.application.update({
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

    // Send to Telegram
    sendToTelegramGroup(aiEval, application).catch(console.error);

    // Generate motivational content
    generateAndSaveContent(applicationId).catch(console.error);

    return NextResponse.json(aiEval);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Ошибка AI-оценки" }, { status: 500 });
  }
}
