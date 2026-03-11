import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

  const { title, body, cta, prompt: userPrompt } = await request.json();

  if (!userPrompt) {
    return NextResponse.json({ error: "Укажите промт для доработки" }, { status: 400 });
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

Запрос модератора: ${userPrompt}

Верни обновлённый пост в формате JSON (без markdown, без \`\`\`):

{
  "title": "<обновлённый заголовок>",
  "body": "<обновлённый текст>",
  "cta": "<обновлённая кнопка>"
}

ВАЖНО:
- Сохраняй общий стиль и тональность
- Не добавляй ничего лишнего
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
