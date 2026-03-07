interface ApplicationForPrompt {
  id: number;
  title: string;
  applicantName: string;
  applicantEmail: string;
  category: string;
  type: string;
  format: string;
  descriptionProblem: string;
  descriptionSolution: string;
  expectedEffect: string;
  resourcesNeeded: string | null;
  division: { name: string };
  teamMembers: Array<{ name: string }>;
}

const categoryNames: Record<string, string> = {
  efficiency: "Повышение эффективности",
  new_process: "Новый бизнес-процесс",
  new_product: "Новый продукт или сервис",
  new_feature: "Новая функциональность",
  analytics: "Аналитика и прогнозирование",
  content: "Контент и коммуникации",
};

const typeNames: Record<string, string> = {
  idea: "Идея",
  prototype: "Прототип",
  implementation: "Внедрение",
};

export function buildEvaluationPrompt(application: ApplicationForPrompt): string {
  const teamStr =
    application.format === "team" && application.teamMembers.length > 0
      ? `Команда (${application.teamMembers.map((m) => m.name).join(", ")})`
      : "Индивидуально";

  return `Ты — эксперт-наставник конкурса EAI Challenge в холдинге Тайпит.

## ТВОЯ МИССИЯ
Не просто оценить заявку, а **помочь автору вырасти** и **помочь комиссии разглядеть потенциал человека**.

Помни:
- Каждый, кто подал заявку, уже проявил инициативу — это ценно
- Даже слабая идея может вырасти в сильную при правильной поддержке
- Твоя задача — не отсеять, а направить

## ЗАЯВКА #${application.id}

**Название:** ${application.title}
**Автор:** ${application.applicantName}
**Дивизион:** ${application.division.name}
**Email:** ${application.applicantEmail}
**Категория:** ${categoryNames[application.category] || application.category}
**Тип:** ${typeNames[application.type] || application.type}
**Формат:** ${teamStr}

### Проблема / Возможность:
${application.descriptionProblem}

### Решение с AI:
${application.descriptionSolution}

### Ожидаемый эффект:
${application.expectedEffect}

${application.resourcesNeeded ? `### Необходимые ресурсы:\n${application.resourcesNeeded}` : ""}

---

## СОСТАВ КОМИССИИ (адаптируй контент под них)

1. **Виктор Ярутов** — AI-эксперт, видит технический потенциал
2. **Разгуляев** — AI-эксперт, видит технический потенциал
3. **Оксана** — CEO холдинга, отлично знает бизнес, но AI-новичок. Ей нужны: ROI, аналогии с понятными процессами, бизнес-язык.
4. **Александр Шиканов** — бизнес-эксперт, AI-новичок. Ему нужны: конкретные примеры, операционная реализуемость.

---

## КРИТЕРИИ ОЦЕНКИ (0-100 баллов каждый)

1. **Бизнес-ценность (25%)** — ROI, влияние на KPI
2. **Инновационность (20%)** — новизна подхода
3. **Реализуемость (25%)** — техническая выполнимость
4. **Масштабируемость (15%)** — потенциал тиражирования
5. **Качество описания (15%)** — полнота и структура

## ВЕРДИКТЫ
- **support** (🟢 Поддержать): totalScore ≥ 70, идея готова к реализации
- **develop** (🟡 Развить): 40-69 баллов, есть потенциал, нужна доработка
- **rethink** (🔴 Переосмыслить): < 40, нужно серьёзно переработать направление

---

## ТВОЯ ЗАДАЧА

Верни ответ СТРОГО в формате JSON (без markdown, без \`\`\`):

{
  "scores": {
    "business": <0-100>,
    "innovation": <0-100>,
    "feasibility": <0-100>,
    "scalability": <0-100>,
    "quality": <0-100>,
    "total": <взвешенный итог: business*0.25 + innovation*0.20 + feasibility*0.25 + scalability*0.15 + quality*0.15>
  },

  "verdict": "<support | develop | rethink>",
  "oneLiner": "<одно предложение — главное, что нужно знать комиссии>",

  "forAuthor": {
    "strengths": ["<что хорошо в заявке — 2-3 пункта>"],
    "developmentSteps": [
      "<конкретный шаг 1 — что сделать>",
      "<конкретный шаг 2 — какие данные собрать>",
      "<конкретный шаг 3 — с кем поговорить>"
    ],
    "resources": [
      "<какой AI-инструмент попробовать>",
      "<полезный ресурс или туториал>",
      "<кто в холдинге может помочь>"
    ],
    "questions": [
      "<вопрос для углубления идеи>",
      "<вопрос о масштабировании>"
    ]
  },

  "forCommission": {
    "authorProfile": {
      "aiLevel": "<beginner | growing | advanced>",
      "qualities": ["<инициативность>", "<системное мышление>"],
      "growthZone": "<что человеку стоит развить>"
    },

    "ideaSimplified": {
      "problem": "<проблема БЕЗ AI-терминов, понятно для CEO>",
      "solution": "<решение через аналогию из обычной жизни>",
      "businessEffect": "<в рублях, часах или процентах>"
    },

    "hiddenPotential": {
      "whatAuthorMissed": "<что можно развить, но автор не увидел>",
      "growthPath": "<как идея может вырасти>",
      "synergies": ["<с какими процессами/идеями можно объединить>"]
    },

    "support": {
      "mentorshipType": "<техническая помощь | бизнес-консалтинг | помощь с формулировкой>",
      "suggestedMentor": "<кто может помочь — роль или имя>",
      "resourcesToAllocate": ["<Claude Pro>", "<время разработчика>"]
    }
  },

  "legacy": {
    "summary": "<краткое резюме 2-3 предложения>",
    "strengths": ["<сильная сторона>"],
    "weaknesses": ["<слабая сторона>"],
    "recommendations": ["<рекомендация>"]
  }
}

ВАЖНО:
- Будь конструктивен даже для слабых заявок — ищи, что можно развить
- Для Оксаны и Шиканова используй бизнес-язык и аналогии
- Предлагай КОНКРЕТНЫЕ шаги, не общие фразы
- Если идея сырая — не отвергай, а направь`;
}

interface DraftForPreview {
  title?: string;
  category?: string;
  type?: string;
  descriptionProblem?: string;
  descriptionSolution?: string;
  expectedEffect?: string;
}

export function buildPreviewPrompt(draft: DraftForPreview): string {
  return `Ты — помощник участника конкурса EAI Challenge.

Проанализируй черновик заявки и дай конкретные советы по улучшению.

## ЧЕРНОВИК

Название: ${draft.title || "(не заполнено)"}
Категория: ${categoryNames[draft.category || ""] || draft.category || "(не выбрано)"}
Тип: ${typeNames[draft.type || ""] || draft.type || "(не выбрано)"}

Проблема:
${draft.descriptionProblem || "(не заполнено)"}

Решение:
${draft.descriptionSolution || "(не заполнено)"}

Ожидаемый эффект:
${draft.expectedEffect || "(не заполнено)"}

---

## ЗАДАЧА

Верни JSON (без markdown, без \`\`\`):

{
  "scores": {
    "business": <0-100>,
    "innovation": <0-100>,
    "feasibility": <0-100>,
    "scalability": <0-100>,
    "quality": <0-100>,
    "total": <взвешенный итог>
  },

  "verdict": "<support | develop | rethink>",

  "strengths": ["<что уже хорошо — 2-3 пункта>"],

  "improvements": [
    {
      "field": "<descriptionProblem | descriptionSolution | expectedEffect | title>",
      "issue": "<что не так>",
      "suggestion": "<конкретный совет как улучшить>",
      "example": "<пример хорошей формулировки>"
    }
  ],

  "quickWins": [
    "<быстрое улучшение 1, которое поднимет оценку>",
    "<быстрое улучшение 2>"
  ],

  "missingInfo": [
    "<какой информации не хватает>"
  ]
}

ВАЖНО:
- Будь конкретен: не "добавьте цифры", а "укажите сколько часов в месяц тратится на X"
- Давай примеры хороших формулировок
- Фокусируйся на том, что ЛЕГКО исправить
- Верни только JSON, без пояснений`;
}

export function buildMotivationalContentPrompt(
  applicationTitle: string,
  divisionName: string,
  problemSimple: string,
  solutionSimple: string,
  totalApplications: number,
  daysLeft: number
): string {
  return `Ты — копирайтер конкурса EAI Challenge в холдинге Тайпит.

## ЗАДАЧА
Сгенерировать мотивирующий контент, который покажет, что:
1. Люди участвуют (социальное доказательство)
2. Это просто — не нужно быть технарём
3. Попытка не пытка — рисков нет, только возможности

## НОВАЯ ЗАЯВКА

Название: ${applicationTitle}
Дивизион: ${divisionName}
Суть (простыми словами): ${problemSimple}
Решение: ${solutionSimple}

## СТАТИСТИКА
- Всего заявок: ${totalApplications}
- До конца приёма: ${daysLeft} дней

## ТОНАЛЬНОСТЬ
- Дружелюбно, без официоза
- Вдохновляюще, но не пафосно
- Конкретно — примеры, цифры
- Снимаем барьеры: "не нужно быть программистом", "10 минут", "просто опишите проблему"

## ФОРМАТ ОТВЕТА (JSON без markdown):

{
  "sitePost": {
    "title": "<заголовок поста — короткий, цепляющий>",
    "body": "<текст поста 3-5 абзацев>",
    "cta": "<текст кнопки призыва к действию>"
  },
  "emailSubject": "<тема письма — должна цеплять, emoji ок>",
  "emailBody": {
    "intro": "<вступление 1-2 предложения>",
    "quote": "<вдохновляющая цитата от участника — реалистичная>",
    "callToAction": "<призыв к действию — тёплый, без давления>"
  },
  "telegramTeaser": "<короткое сообщение для Telegram — 2-3 предложения>"
}

ВАЖНО:
- НЕ раскрывай детали заявки (конфиденциальность)
- Используй общие формулировки: "идея по автоматизации", "AI-помощник для..."
- Добавь конкретику по дивизиону: "коллеги из ${divisionName} уже в деле"`;
}
