import prisma from "@/lib/prisma";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  applicationId?: number;
  recipientType: "author" | "commission";
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, applicationId, recipientType } = options;

  if (!process.env.RESEND_API_KEY) {
    console.log("Email not configured (no RESEND_API_KEY), skipping send");
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        recipientType,
        applicationId: applicationId || null,
        status: "failed",
        error: "RESEND_API_KEY not configured",
      },
    });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "eai@taipit.starec.ai",
        to,
        subject,
        html,
      }),
    });

    const success = response.ok;

    await prisma.emailLog.create({
      data: {
        to,
        subject,
        recipientType,
        applicationId: applicationId || null,
        status: success ? "sent" : "failed",
        error: success ? null : await response.text(),
      },
    });

    return success;
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        recipientType,
        applicationId: applicationId || null,
        status: "failed",
        error: String(error),
      },
    });
    return false;
  }
}

function getScoreClass(score: number): string {
  if (score >= 70) return "score-high";
  if (score >= 40) return "score-mid";
  return "score-low";
}

const verdictClassMap: Record<string, string> = {
  support: "verdict-support",
  develop: "verdict-develop",
  rethink: "verdict-rethink",
};

const verdictTitleMap: Record<string, string> = {
  support: "🟢 Поддержать",
  develop: "🟡 Развить",
  rethink: "🔴 Переосмыслить",
};

interface EvaluationData {
  scoreBusiness: number;
  scoreInnovation: number;
  scoreFeasibility: number;
  scoreScalability: number;
  scoreQuality: number;
  totalScore: number;
  verdict: string;
  oneLiner: string;
  authorStrengths: string;
  developmentSteps: string;
  resourcesForStart: string;
  questionsToThink: string;
  authorAiLevel: string;
  authorQualities: string;
  authorGrowthZone: string;
  problemSimple: string;
  solutionSimple: string;
  businessEffect: string;
  hiddenPotential: string;
  growthPath: string;
  synergies: string;
  mentorshipNeeded: string;
  suggestedMentor: string;
  resourcesToAllocate: string;
}

interface ApplicationData {
  id: number;
  title: string;
  applicantName: string;
  applicantEmail: string;
  descriptionProblem: string;
  descriptionSolution: string;
  expectedEffect: string;
  division: { name: string };
}

function parseJson(str: string): string[] {
  try {
    return JSON.parse(str);
  } catch {
    return [str];
  }
}

export function buildAuthorEmail(
  evaluation: EvaluationData,
  application: ApplicationData
): string {
  const strengths = parseJson(evaluation.authorStrengths);
  const steps = parseJson(evaluation.developmentSteps);
  const resources = parseJson(evaluation.resourcesForStart);
  const questions = parseJson(evaluation.questionsToThink);
  const verdictClass = verdictClassMap[evaluation.verdict] || "verdict-develop";
  const verdictTitle = verdictTitleMap[evaluation.verdict] || evaluation.verdict;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6; }
    .header { background: linear-gradient(135deg, #6382ff, #4ade80); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { padding: 25px; background: #f8f9fa; }
    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 12px; }
    .section h3 { margin-top: 0; color: #333; }
    .verdict-support { background: #d1fae5; border-left: 4px solid #10b981; }
    .verdict-develop { background: #fef3c7; border-left: 4px solid #f59e0b; }
    .verdict-rethink { background: #fee2e2; border-left: 4px solid #ef4444; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 13px; }
    .cta { display: inline-block; background: #6382ff; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Фидбек по вашей заявке</h1>
    <p>EAI Challenge • Заявка #${application.id}</p>
  </div>
  <div class="content">
    <p>Привет, ${application.applicantName}!</p>
    <p>Спасибо за участие в конкурсе EAI Challenge! Мы изучили вашу заявку <strong>«${application.title}»</strong> и хотим поделиться обратной связью.</p>
    <div class="section ${verdictClass}">
      <h3>${verdictTitle}</h3>
      <p>${evaluation.oneLiner}</p>
    </div>
    <div class="section">
      <h3>🎯 Что у вас хорошо</h3>
      <ul>${strengths.map((s) => `<li>${s}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <h3>📈 Как развить идею</h3>
      <p>Вот конкретные шаги, которые помогут усилить заявку:</p>
      <ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
    </div>
    <div class="section">
      <h3>🔧 Ресурсы для старта</h3>
      <ul>${resources.map((r) => `<li>${r}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <h3>💬 Вопросы для размышления</h3>
      <p>Попробуйте ответить на эти вопросы — они помогут углубить идею:</p>
      <ul>${questions.map((q) => `<li>${q}</li>`).join("")}</ul>
    </div>
    <div class="section" style="text-align: center;">
      <p><strong>Есть вопросы или хотите обсудить идею?</strong></p>
      <a href="https://taipit.starec.ai/forum" class="cta">Написать в форум →</a>
    </div>
  </div>
  <div class="footer">
    <p>С верой в ваш потенциал,<br>Команда EAI Challenge</p>
    <p>Холдинг Тайпит • <a href="https://taipit.starec.ai">taipit.starec.ai</a></p>
  </div>
</body>
</html>`;
}

export function buildCommissionEmail(
  evaluation: EvaluationData,
  application: ApplicationData
): string {
  const qualities = parseJson(evaluation.authorQualities);
  const synergies = parseJson(evaluation.synergies);
  const resources = parseJson(evaluation.resourcesToAllocate);

  const aiLevelMap: Record<string, { text: string; cls: string }> = {
    beginner: { text: "Начинающий", cls: "profile-beginner" },
    growing: { text: "Растущий", cls: "profile-growing" },
    advanced: { text: "Продвинутый", cls: "profile-advanced" },
  };
  const aiLevel = aiLevelMap[evaluation.authorAiLevel] || aiLevelMap.growing;

  const verdictClass = verdictClassMap[evaluation.verdict] || "verdict-develop";
  const verdictTitle = verdictTitleMap[evaluation.verdict] || evaluation.verdict;

  const sc = (v: number) => getScoreClass(v);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; }
    .header { background: #0a0e1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .quick-summary { background: #1a1f2e; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .verdict-badge { padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; }
    .verdict-support { background: #10b981; }
    .verdict-develop { background: #f59e0b; }
    .verdict-rethink { background: #ef4444; }
    .content { padding: 20px; background: #f8f9fa; }
    .section { background: white; padding: 15px; margin: 12px 0; border-radius: 8px; }
    .section-title { font-weight: bold; color: #6382ff; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .scores { display: flex; flex-wrap: wrap; gap: 10px; }
    .score-item { flex: 1; min-width: 120px; text-align: center; padding: 10px; border-radius: 8px; }
    .score-high { background: #d1fae5; color: #065f46; }
    .score-mid { background: #fef3c7; color: #92400e; }
    .score-low { background: #fee2e2; color: #991b1b; }
    .score-value { font-size: 24px; font-weight: bold; }
    .score-label { font-size: 12px; }
    .profile-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
    .profile-beginner { background: #fef3c7; color: #92400e; }
    .profile-growing { background: #dbeafe; color: #1e40af; }
    .profile-advanced { background: #d1fae5; color: #065f46; }
    .for-member { margin: 5px 0; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; font-size: 14px; }
    ul { padding-left: 20px; margin: 10px 0; }
    li { margin: 6px 0; }
    .full-text { background: #f9fafb; padding: 15px; border-left: 3px solid #d1d5db; margin: 10px 0; font-size: 14px; color: #4b5563; }
    .footer { padding: 15px; text-align: center; color: #666; font-size: 12px; }
    .action-buttons { text-align: center; margin: 20px 0; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin: 5px; }
    .btn-primary { background: #6382ff; color: white; }
    .btn-secondary { background: #e5e7eb; color: #374151; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 EAI Challenge: Заявка #${application.id}</h1>
    <p>AI-анализ для комиссии</p>
  </div>
  <div class="quick-summary">
    <div>
      <strong>${application.title}</strong><br>
      <span style="color:#8898b8">${application.applicantName} • ${application.division.name}</span>
    </div>
    <div>
      <span class="verdict-badge ${verdictClass}">${verdictTitle}</span>
      <span style="font-size:24px;font-weight:bold;margin-left:15px">${Math.round(evaluation.totalScore)}</span>
    </div>
  </div>
  <div class="content">
    <div class="section" style="border-left:4px solid #6382ff">
      <strong>⚡ Суть:</strong> ${evaluation.oneLiner}
    </div>
    <div class="section">
      <div class="section-title">📊 Оценки</div>
      <div class="scores">
        <div class="score-item ${sc(evaluation.scoreBusiness)}">
          <div class="score-value">${evaluation.scoreBusiness}</div>
          <div class="score-label">Бизнес</div>
        </div>
        <div class="score-item ${sc(evaluation.scoreInnovation)}">
          <div class="score-value">${evaluation.scoreInnovation}</div>
          <div class="score-label">Инновации</div>
        </div>
        <div class="score-item ${sc(evaluation.scoreFeasibility)}">
          <div class="score-value">${evaluation.scoreFeasibility}</div>
          <div class="score-label">Реализуемость</div>
        </div>
        <div class="score-item ${sc(evaluation.scoreScalability)}">
          <div class="score-value">${evaluation.scoreScalability}</div>
          <div class="score-label">Масштаб</div>
        </div>
        <div class="score-item ${sc(evaluation.scoreQuality)}">
          <div class="score-value">${evaluation.scoreQuality}</div>
          <div class="score-label">Качество</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">👤 Профиль автора</div>
      <p><strong>AI-уровень:</strong> <span class="profile-badge ${aiLevel.cls}">${aiLevel.text}</span></p>
      <p><strong>Что показывает заявка:</strong></p>
      <ul>${qualities.map((q) => `<li>${q}</li>`).join("")}</ul>
      <p><strong>Зона роста:</strong> ${evaluation.authorGrowthZone}</p>
    </div>
    <div class="section">
      <div class="section-title">📋 Суть для руководства</div>
      <div class="for-member"><strong>Проблема простыми словами:</strong> ${evaluation.problemSimple}</div>
      <div class="for-member"><strong>Решение (аналогия):</strong> ${evaluation.solutionSimple}</div>
      <div class="for-member"><strong>Бизнес-эффект:</strong> ${evaluation.businessEffect}</div>
    </div>
    <div class="section">
      <div class="section-title">💎 Скрытый потенциал</div>
      <p><strong>Что автор не увидел:</strong> ${evaluation.hiddenPotential}</p>
      <p><strong>Как идея может вырасти:</strong> ${evaluation.growthPath}</p>
      <p><strong>Синергии:</strong></p>
      <ul>${synergies.map((s) => `<li>${s}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <div class="section-title">🤝 Как поддержать автора</div>
      <p><strong>Нужен менторинг:</strong> ${evaluation.mentorshipNeeded}</p>
      <p><strong>Кто может помочь:</strong> ${evaluation.suggestedMentor}</p>
      <p><strong>Рекомендуемые ресурсы:</strong></p>
      <ul>${resources.map((r) => `<li>${r}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <div class="section-title">📄 Полный текст заявки</div>
      <p><strong>Проблема:</strong></p>
      <div class="full-text">${application.descriptionProblem}</div>
      <p><strong>Решение:</strong></p>
      <div class="full-text">${application.descriptionSolution}</div>
      <p><strong>Ожидаемый эффект:</strong></p>
      <div class="full-text">${application.expectedEffect}</div>
    </div>
    <div class="action-buttons">
      <a href="https://taipit.starec.ai/admin/applications/${application.id}" class="btn btn-primary">Открыть в админке →</a>
      <a href="mailto:${application.applicantEmail}" class="btn btn-secondary">Написать автору</a>
    </div>
  </div>
  <div class="footer">
    <p>EAI Challenge • Холдинг Тайпит • <a href="https://taipit.starec.ai">taipit.starec.ai</a></p>
  </div>
</body>
</html>`;
}
