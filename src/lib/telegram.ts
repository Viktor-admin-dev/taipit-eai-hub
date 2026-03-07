import prisma from "@/lib/prisma";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

interface EvaluationData {
  id: number;
  scoreBusiness: number;
  scoreInnovation: number;
  scoreFeasibility: number;
  scoreScalability: number;
  scoreQuality: number;
  totalScore: number;
  verdict: string;
  oneLiner: string;
  hiddenPotential: string;
  mentorshipNeeded: string;
  suggestedMentor: string;
  resourcesToAllocate: string;
}

interface ApplicationData {
  id: number;
  title: string;
  applicantName: string;
  category: string;
  type: string;
  division: { name: string };
}

const verdictText: Record<string, string> = {
  support: "🟢 Поддержать",
  develop: "🟡 Развить",
  rethink: "🔴 Переосмыслить",
};

function formatTelegramMessage(
  evaluation: EvaluationData,
  application: ApplicationData
): string {
  let resources: string[] = [];
  try {
    resources = JSON.parse(evaluation.resourcesToAllocate);
  } catch {
    resources = [evaluation.resourcesToAllocate];
  }

  return `🚀 *Новая заявка #${application.id}*

*${application.title}*
👤 ${application.applicantName} • ${application.division.name}

━━━━━━━━━━━━━━━━━━━━
📊 *Оценка AI*

🏢 Бизнес: ${evaluation.scoreBusiness}/100
💡 Инновации: ${evaluation.scoreInnovation}/100
⚙️ Реализуемость: ${evaluation.scoreFeasibility}/100
📈 Масштаб: ${evaluation.scoreScalability}/100
📝 Качество: ${evaluation.scoreQuality}/100

*Итого: ${Math.round(evaluation.totalScore)} баллов*
${verdictText[evaluation.verdict] || evaluation.verdict}

━━━━━━━━━━━━━━━━━━━━
⚡ *Суть*

${evaluation.oneLiner}

━━━━━━━━━━━━━━━━━━━━
💎 *Скрытый потенциал*

${evaluation.hiddenPotential}

━━━━━━━━━━━━━━━━━━━━
🤝 *Рекомендации комиссии*

• Менторинг: ${evaluation.mentorshipNeeded}
• Ментор: ${evaluation.suggestedMentor}
• Ресурсы: ${resources.join(", ")}

🔗 [Открыть в админке](https://taipit.starec.ai/admin/applications/${application.id})`;
}

export async function sendToTelegramGroup(
  evaluation: EvaluationData,
  application: ApplicationData
): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    console.log("Telegram not configured, skipping");
    return;
  }

  const message = formatTelegramMessage(evaluation, application);

  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    await prisma.telegramLog.create({
      data: {
        applicationId: application.id,
        messageId: result.result?.message_id || null,
        chatId,
        status: result.ok ? "sent" : "failed",
        error: result.ok ? null : JSON.stringify(result),
      },
    });
  } catch (error) {
    await prisma.telegramLog.create({
      data: {
        applicationId: application.id,
        chatId,
        status: "failed",
        error: String(error),
      },
    });
  }
}
