import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { sendEmail, buildCommissionEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId, evaluationId } = await request.json();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { division: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  let evaluation;
  if (evaluationId) {
    evaluation = await prisma.aIEvaluation.findUnique({ where: { id: evaluationId } });
  } else {
    evaluation = await prisma.aIEvaluation.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!evaluation) {
    return NextResponse.json(
      { error: "AI-оценка не найдена. Сначала выполните оценку." },
      { status: 400 }
    );
  }

  const members = await prisma.commissionMember.findMany({
    where: { isActive: true },
  });

  if (members.length === 0) {
    return NextResponse.json({ error: "Нет активных членов комиссии" }, { status: 400 });
  }

  const html = buildCommissionEmail(evaluation, application);
  const subject = `EAI Challenge: Заявка #${applicationId} — ${application.title}`;

  const results = await Promise.all(
    members.map((member) =>
      sendEmail({
        to: member.email,
        subject,
        html,
        applicationId,
        recipientType: "commission",
      })
    )
  );

  const sent = results.filter(Boolean).length;

  return NextResponse.json({ sent, total: members.length });
}
