import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyForumToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const auth = verifyForumToken(request);
    if (!auth) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { topicId, body } = await request.json();

    if (!topicId || !body?.trim()) {
      return NextResponse.json({ error: "Заполните текст ответа" }, { status: 400 });
    }

    // Check topic exists and is published
    const topic = await prisma.forumTopic.findUnique({ where: { id: Number(topicId) } });
    if (!topic || topic.status !== "published") {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    // Moderator replies are auto-published
    const status = auth.role === "moderator" ? "published" : "pending";
    const isModeratorReply = auth.role === "moderator";

    const reply = await prisma.forumReply.create({
      data: {
        topicId: Number(topicId),
        userId: auth.userId,
        body: body.trim(),
        status,
        isModeratorReply,
      },
    });

    return NextResponse.json({ reply, status });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Ошибка создания ответа" }, { status: 500 });
  }
}
