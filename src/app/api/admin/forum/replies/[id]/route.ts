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
    const replyId = Number(id);
    const body = await request.json();

    if (!body.status || !["pending", "published", "rejected"].includes(body.status)) {
      return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
    }

    const reply = await prisma.forumReply.update({
      where: { id: replyId },
      data: { status: body.status },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Admin reply update error:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.forumReply.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin reply delete error:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
