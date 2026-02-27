import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const divisions = [
  "0012 Дивизион корпусов",
  "0026 Дивизион измерительных приборов",
  "0043 Дивизион Честный знак",
  "0050 Дивизион ИБП и стабилизаторов",
  "0055 Дивизион Внешняя торговля",
  "0056 Дивизион Евротекстиль",
  "0086 Дивизион транспорта",
  "0089 Дивизион вторичных полимеров",
  "0095 Дивизион медоборудования",
  "0231 Дивизион теплосчетчиков",
  "0232 Дивизион промышленных расходомеров",
  "0036 Дивизион фурнитуры и МК",
  "0262 Дивизион мебели",
  "0041 Дивизион управления недвижимостью",
  "0070 Дивизион управления",
  "1000 Холдинговый дивизион",
  "1100 Дивизион казначейство",
  "0014 Дивизион отопительного оборудования",
  "0084 Дивизион средств индивидуальной защиты",
];

const testimonials = [
  {
    name: "Валерия Новикова",
    position: "Директор по E-Commerce",
    roleDescription: "Продажи на Amazon и маркетплейсах ОАЭ",
    divisionName: "55 дивизион (Treejar, ОАЭ)",
    photoUrl: "/photos/valeria.jpg",
    summary: "Claude помог пересмотреть подход к работе и освободил до 3 часов в день",
    text: "Когда впервые услышала про AI-ассистентов, отнеслась скептически: «очередная хайповая штука». Но когда попробовала Claude для анализа отзывов покупателей на Amazon — была в шоке. То, на что уходило полдня ручного разбора, AI делает за минуты. Теперь Claude — мой ежедневный помощник: от написания листингов до анализа конкурентов. Экономия времени — примерно 2-3 часа в день.",
    tools: JSON.stringify(["Claude Pro", "Amazon Seller Central"]),
    results: JSON.stringify(["Экономия: 2-3 часа/день", "Качество листингов: +40%", "Скорость анализа: x10"]),
  },
  {
    name: "Дмитрий Дюков",
    position: "Директор по закупкам / Продукт-менеджер",
    roleDescription: "Закупки в Китае + продуктовое управление офисными креслами",
    divisionName: "55 дивизион (Treejar, ОАЭ)",
    photoUrl: "/photos/dmitry.jpg",
    summary: "AI автоматизировал рутину переговоров с поставщиками и анализ рынка",
    text: "В закупках огромный объём переписки с китайскими поставщиками. Раньше на каждое письмо уходило 15-20 минут. Сейчас Claude готовит драфты ответов, переводит технические спецификации, помогает с расчётами. Как продукт-менеджер использую для анализа трендов рынка офисной мебели. Claude парсит отчёты, выделяет ключевые инсайты. Время на аналитику сократилось вдвое.",
    tools: JSON.stringify(["Claude Pro", "Excel + AI"]),
    results: JSON.stringify(["Переписка: -70% времени", "Аналитика рынка: x2 быстрее", "Ошибки в спецификациях: -90%"]),
  },
  {
    name: "Никита Лыжин",
    position: "Директор по маркетингу",
    roleDescription: "Продвижение и реклама в 55-м дивизионе",
    divisionName: "55 дивизион (Treejar, ОАЭ)",
    photoUrl: "/photos/nikita.jpg",
    summary: "Claude полностью изменил подход к созданию маркетингового контента",
    text: "Маркетинг — это постоянный поток контента: посты, письма, описания, креативы. До Claude команда из 3 человек не успевала закрывать все задачи. Сейчас с помощью AI мы генерируем в 5 раз больше контента при том же ресурсе. Claude пишет первые драфты, адаптирует под разные платформы, даже предлагает A/B-варианты заголовков. Качество не упало — мы просто стали быстрее.",
    tools: JSON.stringify(["Claude Pro", "Canva + AI", "Midjourney"]),
    results: JSON.stringify(["Контент: x5 объём", "Time-to-market: -60%", "Команда: без расширения"]),
  },
  {
    name: "Юлия Емельянова",
    position: "Заместитель директора по маркетингу",
    roleDescription: "Операционные и стратегические задачи дивизиона",
    divisionName: "55 дивизион (Treejar, ОАЭ)",
    photoUrl: "/photos/julia.jpg",
    summary: "AI стал незаменимым инструментом для стратегического планирования",
    text: "Моя работа — связывать стратегию с операционкой. Это много данных, отчётов, презентаций. Claude помогает структурировать информацию: из хаотичных заметок с митингов делает чёткие action items, из сырых данных — понятные выводы для руководства. Особенно ценно для подготовки квартальных отчётов — то, что занимало неделю, теперь делается за 2 дня.",
    tools: JSON.stringify(["Claude Pro", "Notion AI", "Google Sheets"]),
    results: JSON.stringify(["Отчёты: x3 быстрее", "Качество презентаций: +50%", "Митинги: -30% времени"]),
  },
];

const siteConfig = [
  { key: "contest_start_date", value: new Date().toISOString() },
  { key: "contest_end_date", value: "2026-04-30T23:59:59.000Z" },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.siteConfig.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.division.deleteMany();

  // Seed divisions
  for (const name of divisions) {
    await prisma.division.create({ data: { name } });
  }
  console.log(`Created ${divisions.length} divisions`);

  // Seed testimonials
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`Created ${testimonials.length} testimonials`);

  // Seed site config
  for (const c of siteConfig) {
    await prisma.siteConfig.create({ data: c });
  }
  console.log(`Created ${siteConfig.length} config entries`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
