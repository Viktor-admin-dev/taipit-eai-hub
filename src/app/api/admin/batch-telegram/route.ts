import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { sendToTelegramGroup } from "@/lib/telegram";

// POST /api/admin/batch-telegram
// Sends Telegram notifications for all existing AI evaluations (latest per application)
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 503 });
  }

  const applications = await prisma.application.findMany({
    include: {
      division: true,
      teamMembers: true,
      aiEvaluations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { id: "asc" },
  });

  const toSend = applications.filter((a) => a.aiEvaluations.length > 0);

  if (toSend.length === 0) {
    return NextResponse.json({ message: "No evaluated applications found", sent: 0 });
  }

  // Run in background
  (async () => {
    let sent = 0;
    for (const app of toSend) {
      try {
        await sendToTelegramGroup(app.aiEvaluations[0], app);
        sent++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Telegram send failed for #${app.id}:`, err);
      }
    }
    console.log(`Batch Telegram complete: ${sent}/${toSend.length} sent`);
  })().catch(console.error);

  return NextResponse.json({
    message: `Отправка ${toSend.length} уведомлений запущена в фоне`,
    count: toSend.length,
    applicationIds: toSend.map((a) => a.id),
  });
}
