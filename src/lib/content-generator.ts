import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";
import { buildMotivationalContentPrompt } from "@/lib/evaluation-prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ContentResult {
  sitePost: { title: string; body: string; cta: string };
  emailSubject: string;
  emailBody: { intro: string; quote: string; callToAction: string };
  telegramTeaser: string;
}

export async function generateAndSaveContent(applicationId: number): Promise<{
  post: { id: number; title: string };
  campaign: { id: number; subject: string };
  telegramTeaser: string;
} | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set, skipping content generation");
    return null;
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      division: true,
      aiEvaluations: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  if (!application) return null;

  const evaluation = application.aiEvaluations[0];
  const totalApplications = await prisma.application.count();

  // Calculate days left (contest ends March 31, 2026)
  const contestEnd = new Date("2026-03-31");
  const daysLeft = Math.max(
    0,
    Math.ceil((contestEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const problemSimple = evaluation?.problemSimple || "автоматизация рабочих процессов";
  const solutionSimple = evaluation?.solutionSimple || "AI-решение для оптимизации работы";

  const prompt = buildMotivationalContentPrompt(
    application.title,
    application.division.name,
    problemSimple,
    solutionSimple,
    totalApplications,
    daysLeft
  );

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const content: ContentResult = JSON.parse(text);

    const post = await prisma.newsPost.create({
      data: {
        applicationId,
        title: content.sitePost.title,
        body: content.sitePost.body,
        cta: content.sitePost.cta,
      },
    });

    const emailBody = JSON.stringify({
      intro: content.emailBody.intro,
      quote: content.emailBody.quote,
      callToAction: content.emailBody.callToAction,
      totalApplications,
      daysLeft,
    });

    const campaign = await prisma.emailCampaign.create({
      data: {
        subject: content.emailSubject,
        body: emailBody,
        triggerType: "new_application",
        applicationIds: JSON.stringify([applicationId]),
      },
    });

    return {
      post: { id: post.id, title: post.title },
      campaign: { id: campaign.id, subject: campaign.subject },
      telegramTeaser: content.telegramTeaser,
    };
  } catch (error) {
    console.error("Content generation error:", error);
    return null;
  }
}
