import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const topicId = Number(id);
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status && ["pending", "published", "rejected"].includes(body.status)) {
      data.status = body.status;
    }
    if (typeof body.isPinned === "boolean") {
      data.isPinned = body.isPinned;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
    }

    const topic = await prisma.forumTopic.update({
      where: { id: topicId },
      data,
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Admin topic update error:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}
