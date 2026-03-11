import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPreviewPrompt } from "@/lib/evaluation-prompt";
import { buildFileContentBlocks } from "@/lib/file-content";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const draft = await request.json();

  if (!draft.title || !draft.descriptionProblem || !draft.descriptionSolution) {
    return NextResponse.json(
      { error: "Заполните название, описание проблемы и решения" },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI-сервис временно недоступен" },
      { status: 503 }
    );
  }

  try {
    const prompt = buildPreviewPrompt(draft);
    const fileBlocks = await buildFileContentBlocks(draft.filesUrls || null);
    const userContent = fileBlocks.length > 0
      ? [{ type: "text" as const, text: prompt }, ...fileBlocks]
      : prompt;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{ role: "user", content: userContent }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const analysis = JSON.parse(jsonText);

    return NextResponse.json({
      scores: analysis.scores,
      verdict: analysis.verdict,
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      quickWins: analysis.quickWins || [],
      missingInfo: analysis.missingInfo || [],
      readyToSubmit: (analysis.scores?.total || 0) >= 50,
      message:
        (analysis.scores?.total || 0) >= 50
          ? "Заявка готова к отправке! Вы можете улучшить её или отправить сейчас."
          : "Рекомендуем доработать заявку перед отправкой. Смотрите советы ниже.",
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: "Ошибка анализа заявки" },
      { status: 500 }
    );
  }
}
