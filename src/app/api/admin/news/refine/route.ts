import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI-сервис недоступен" }, { status: 503 });
  }

  const { title, body, cta, prompt: userPrompt, postId } = await request.json();

  if (!userPrompt) {
    return NextResponse.json({ error: "Укажите промт для доработки" }, { status: 400 });
  }

  // Fetch application data if post is linked to one
  let applicationContext = "";
  if (postId) {
    const post = await prisma.newsPost.findUnique({
      where: { id: postId },
    });
    if (post?.applicationId) {
      const app = await prisma.application.findUnique({
        where: { id: post.applicationId },
        include: { division: true, aiEvaluations: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      if (app) {
        const eval_ = app.aiEvaluations[0];
        applicationContext = `

## ДАННЫЕ ЗАЯВКИ (используй при необходимости)
- Автор: ${app.applicantName}
- Дивизион: ${app.division.name}
- Название идеи: ${app.title}
- Проблема: ${app.descriptionProblem}
- Решение: ${app.descriptionSolution}
- Ожидаемый эффект: ${app.expectedEffect}
${eval_ ? `- AI-оценка: ${eval_.totalScore}/100, вердикт: ${eval_.verdict}
- Суть простыми словами: ${eval_.problemSimple}
- Решение простыми словами: ${eval_.solutionSimple}
- Бизнес-эффект: ${eval_.businessEffect}` : ""}`;
      }
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Ты — редактор новостей конкурса EAI Challenge в холдинге Тайпит.

Текущий пост:
- Заголовок: ${title || "(пусто)"}
- Текст: ${body || "(пусто)"}
- Кнопка (CTA): ${cta || "(пусто)"}
${applicationContext}

Запрос модератора: ${userPrompt}

Верни обновлённый пост в формате JSON (без markdown, без \`\`\`):

{
  "title": "<обновлённый заголовок>",
  "body": "<обновлённый текст>",
  "cta": "<обновлённая кнопка>"
}

ВАЖНО:
- Выполни запрос модератора максимально точно
- Сохраняй тёплый мотивирующий стиль
- Верни ТОЛЬКО JSON`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonText = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    const result = JSON.parse(jsonText);

    return NextResponse.json({
      title: result.title || title,
      body: result.body || body,
      cta: result.cta || cta,
    });
  } catch (error) {
    console.error("Refine error:", error);
    return NextResponse.json({ error: "Ошибка AI-доработки" }, { status: 500 });
  }
}
