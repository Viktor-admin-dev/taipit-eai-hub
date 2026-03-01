import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "taipit-eai-hub-secret-key-2026";

export async function POST(request: NextRequest) {
  try {
    const { name, email, divisionId } = await request.json();

    if (!name || !email || !divisionId) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Введите корректный email" },
        { status: 400 }
      );
    }

    const division = await prisma.division.findUnique({ where: { id: Number(divisionId) } });
    if (!division) {
      return NextResponse.json(
        { error: "Дивизион не найден" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, divisionId: division.id },
      create: {
        email,
        name,
        role: "employee",
        divisionId: division.id,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("forum_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Forum login error:", error);
    return NextResponse.json(
      { error: "Ошибка авторизации" },
      { status: 500 }
    );
  }
}
