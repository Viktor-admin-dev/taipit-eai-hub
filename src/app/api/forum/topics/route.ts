import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyForumToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = 20;

    const auth = verifyForumToken(request);
    const currentUserId = auth?.userId;

    // Build where: published OR own topics
    const statusFilter: object[] = [{ status: "published" }];
    if (currentUserId) {
      statusFilter.push({ userId: currentUserId });
    }

    const where: Record<string, unknown> = {
      OR: statusFilter,
    };
    if (category && category !== "all") {
      where.category = category;
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, role: true } },
          _count: { select: { replies: { where: { status: "published" } } } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumTopic.count({ where }),
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
        authorRole: t.user.role,
        userId: t.user.id,
        repliesCount: t._count.replies,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Ошибка загрузки тем" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyForumToken(request);
    if (!auth) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { title, body, category } = await request.json();

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Заполните название и текст" }, { status: 400 });
    }

    const validCategories = ["ai-tools", "business", "technical", "contest"];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: "Неверная категория" }, { status: 400 });
    }

    // Moderator topics are auto-published
    const status = auth.role === "moderator" ? "published" : "pending";

    const topic = await prisma.forumTopic.create({
      data: {
        userId: auth.userId,
        title: title.trim(),
        body: body.trim(),
        category: category || null,
        status,
      },
    });

    return NextResponse.json({ topic, status });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Ошибка создания темы" }, { status: 500 });
  }
}
