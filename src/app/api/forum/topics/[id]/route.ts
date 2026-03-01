import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyForumToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = Number(id);
    if (isNaN(topicId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const auth = verifyForumToken(request);
    const currentUserId = auth?.userId;

    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
      include: {
        user: { select: { id: true, name: true, role: true, division: { select: { name: true } } } },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    // Only visible if published or own topic
    if (topic.status !== "published" && topic.userId !== currentUserId) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    // Replies: published + own pending
    const replyStatusFilter: object[] = [{ status: "published" }];
    if (currentUserId) {
      replyStatusFilter.push({ userId: currentUserId });
    }

    const replies = await prisma.forumReply.findMany({
      where: {
        topicId,
        OR: replyStatusFilter,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      topic: {
        id: topic.id,
        title: topic.title,
        body: topic.body,
        category: topic.category,
        status: topic.status,
        isPinned: topic.isPinned,
        createdAt: topic.createdAt,
        author: topic.user.name,
        authorRole: topic.user.role,
        authorDivision: topic.user.division?.name,
        userId: topic.user.id,
      },
      replies: replies.map((r) => ({
        id: r.id,
        body: r.body,
        status: r.status,
        isModeratorReply: r.isModeratorReply,
        createdAt: r.createdAt,
        author: r.user.name,
        authorRole: r.user.role,
        userId: r.user.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json({ error: "Ошибка загрузки темы" }, { status: 500 });
  }
}
