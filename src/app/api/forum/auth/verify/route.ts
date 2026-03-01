import { NextRequest, NextResponse } from "next/server";
import { verifyForumToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const payload = verifyForumToken(request);
    if (!payload) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, division: { select: { id: true, name: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Токен недействителен" }, { status: 401 });
  }
}
