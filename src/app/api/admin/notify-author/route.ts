import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { sendEmail, buildAuthorEmail } from "@/lib/email";

// GET /api/admin/notify-author?applicationId=X&evaluationId=Y
// Returns preview of the author feedback email (without sending)
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applicationId = parseInt(searchParams.get("applicationId") || "");
  const evaluationId = searchParams.get("evaluationId") ? parseInt(searchParams.get("evaluationId")!) : null;

  if (isNaN(applicationId)) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { division: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const evaluation = evaluationId
    ? await prisma.aIEvaluation.findUnique({ where: { id: evaluationId } })
    : await prisma.aIEvaluation.findFirst({ where: { applicationId }, orderBy: { createdAt: "desc" } });

  if (!evaluation) {
    return NextResponse.json({ error: "AI-оценка не найдена" }, { status: 400 });
  }

  const html = buildAuthorEmail(evaluation, application);
  const from = process.env.EMAIL_FROM || "eai@taipit.starec.ai";
  const subject = `Фидбек по вашей заявке «${application.title}» — EAI Challenge`;
  const resendConfigured = !!process.env.RESEND_API_KEY;

  return NextResponse.json({ from, to: application.applicantEmail, subject, html, resendConfigured });
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId, evaluationId, subject: customSubject } = await request.json();

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
  const subject = customSubject || `Фидбек по вашей заявке «${application.title}» — EAI Challenge`;

  const ok = await sendEmail({
    to: application.applicantEmail,
    subject,
    html,
    applicationId,
    recipientType: "author",
  });

  return NextResponse.json({ sent: ok });
}
