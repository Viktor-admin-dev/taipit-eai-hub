import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { sendEmail, buildAuthorEmail } from "@/lib/email";

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

  const html = buildAuthorEmail(evaluation, application);
  const subject = `Фидбек по вашей заявке «${application.title}» — EAI Challenge`;

  const ok = await sendEmail({
    to: application.applicantEmail,
    subject,
    html,
    applicationId,
    recipientType: "author",
  });

  return NextResponse.json({ sent: ok });
}
