import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";
import { buildEvaluationPrompt } from "@/lib/evaluation-prompt";
import { sendToTelegramGroup } from "@/lib/telegram";
import { generateAndSaveContent } from "@/lib/content-generator";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function runPostSubmitFlow(applicationId: number) {
  if (!process.env.ANTHROPIC_API_KEY) return;

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { division: true, teamMembers: true },
    });
    if (!application) return;

    const prompt = buildEvaluationPrompt(application);
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

    await sendToTelegramGroup(aiEval, application);
    await generateAndSaveContent(applicationId);
  } catch (err) {
    console.error("Post-submit AI flow error:", err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("division");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (divisionId) where.divisionId = parseInt(divisionId);
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          division: true,
          teamMembers: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      applicantName,
      applicantEmail,
      divisionId,
      title,
      category,
      type,
      format,
      teamMembers,
      descriptionProblem,
      descriptionSolution,
      expectedEffect,
      resourcesNeeded,
    } = body;

    // Validate required fields
    if (!applicantName || !applicantEmail || !divisionId || !title || !category || !type) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Validate description lengths
    if (descriptionProblem?.length < 100 || descriptionSolution?.length < 100) {
      return NextResponse.json(
        { error: "Описание должно содержать минимум 100 символов" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        applicantName,
        applicantEmail,
        divisionId: parseInt(divisionId),
        title,
        category,
        type,
        format: format || "individual",
        descriptionProblem,
        descriptionSolution,
        expectedEffect,
        resourcesNeeded: resourcesNeeded || null,
        teamMembers: format === "team" && teamMembers?.length > 0
          ? {
              create: teamMembers.map((member: { name: string; position?: string; divisionName?: string }) => ({
                name: member.name,
                position: member.position || null,
                divisionName: member.divisionName || null,
              })),
            }
          : undefined,
      },
      include: {
        division: true,
        teamMembers: true,
      },
    });

    // Run AI evaluation + Telegram + content generation in background
    runPostSubmitFlow(application.id).catch(console.error);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Ошибка при создании заявки" },
      { status: 500 }
    );
  }
}
