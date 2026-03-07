import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.commissionMember.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, role, profile } = await request.json();

  if (!name || !email || !role) {
    return NextResponse.json({ error: "name, email, role обязательны" }, { status: 400 });
  }

  try {
    const member = await prisma.commissionMember.create({
      data: { name, email, role, profile: profile || null },
    });
    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email уже используется" }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, email, role, profile, isActive } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  }

  const member = await prisma.commissionMember.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(profile !== undefined && { profile }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(member);
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "");

  if (!id) {
    return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  }

  await prisma.commissionMember.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
