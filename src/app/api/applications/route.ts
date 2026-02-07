import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("division");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (divisionId) where.divisionId = parseInt(divisionId);
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          division: true,
          teamMembers: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      applicantName,
      applicantEmail,
      divisionId,
      title,
      category,
      type,
      format,
      teamMembers,
      descriptionProblem,
      descriptionSolution,
      expectedEffect,
      resourcesNeeded,
    } = body;

    // Validate required fields
    if (!applicantName || !applicantEmail || !divisionId || !title || !category || !type) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Validate description lengths
    if (descriptionProblem?.length < 100 || descriptionSolution?.length < 100) {
      return NextResponse.json(
        { error: "Описание должно содержать минимум 100 символов" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        applicantName,
        applicantEmail,
        divisionId: parseInt(divisionId),
        title,
        category,
        type,
        format: format || "individual",
        descriptionProblem,
        descriptionSolution,
        expectedEffect,
        resourcesNeeded: resourcesNeeded || null,
        teamMembers: format === "team" && teamMembers?.length > 0
          ? {
              create: teamMembers.map((member: { name: string; position?: string; divisionName?: string }) => ({
                name: member.name,
                position: member.position || null,
                divisionName: member.divisionName || null,
              })),
            }
          : undefined,
      },
      include: {
        division: true,
        teamMembers: true,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Ошибка при создании заявки" },
      { status: 500 }
    );
  }
}
