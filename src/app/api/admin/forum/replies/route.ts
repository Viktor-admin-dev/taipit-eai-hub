import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const replies = await prisma.forumReply.findMany({
      where: { status },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        topic: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingCount = await prisma.forumReply.count({ where: { status: "pending" } });

    return NextResponse.json({
      replies: replies.map((r) => ({
        id: r.id,
        body: r.body,
        status: r.status,
        isModeratorReply: r.isModeratorReply,
        createdAt: r.createdAt,
        author: r.user.name,
        authorEmail: r.user.email,
        topicId: r.topic.id,
        topicTitle: r.topic.title,
      })),
      pendingCount,
    });
  } catch (error) {
    console.error("Admin forum replies error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { topicId, body } = await request.json();

    if (!topicId || !body?.trim()) {
      return NextResponse.json({ error: "Заполните текст ответа" }, { status: 400 });
    }

    // Find moderator user
    let moderator = await prisma.user.findUnique({ where: { email: "moderator@taipit.ru" } });
    if (!moderator) {
      moderator = await prisma.user.create({
        data: { email: "moderator@taipit.ru", name: "Модератор", role: "moderator" },
      });
    }

    const reply = await prisma.forumReply.create({
      data: {
        topicId: Number(topicId),
        userId: moderator.id,
        body: body.trim(),
        status: "published",
        isModeratorReply: true,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Admin reply create error:", error);
    return NextResponse.json({ error: "Ошибка создания ответа" }, { status: 500 });
  }
}
