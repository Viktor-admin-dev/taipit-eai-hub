import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [topics, total, pendingCount] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true, division: { select: { name: true } } } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumTopic.count({ where }),
      prisma.forumTopic.count({ where: { status: "pending" } }),
    ]);

    return NextResponse.json({
      topics: topics.map((t) => ({
        id: t.id,
        title: t.title,
        body: t.body,
        category: t.category,
        status: t.status,
        isPinned: t.isPinned,
        createdAt: t.createdAt,
        author: t.user.name,
        authorEmail: t.user.email,
        authorRole: t.user.role,
        authorDivision: t.user.division?.name || null,
        repliesCount: t._count.replies,
      })),
      total,
      pendingCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin forum topics error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
