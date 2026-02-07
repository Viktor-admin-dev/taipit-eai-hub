import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        division: true,
        teamMembers: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    const body = await request.json();

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get current application for status history
    const current = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If status is changing, create status history record
    if (body.status && body.status !== current.status) {
      await prisma.statusChange.create({
        data: {
          applicationId,
          fromStatus: current.status,
          toStatus: body.status,
          comment: body.statusComment || null,
        },
      });
    }

    // Update application
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: body.status,
        scoreBusiness: body.scoreBusiness,
        scoreInnovation: body.scoreInnovation,
        scoreFeasibility: body.scoreFeasibility,
        scoreScalability: body.scoreScalability,
        scoreQuality: body.scoreQuality,
        expertComments: body.expertComments,
      },
      include: {
        division: true,
        teamMembers: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
