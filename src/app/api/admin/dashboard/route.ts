import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "taipit-eai-hub-secret-key-2026";

const categoryLabels: Record<string, string> = {
  efficiency: "Повышение эффективности",
  new_process: "Новый бизнес-процесс",
  new_product: "Новый продукт или сервис",
  new_feature: "Новая функциональность",
  analytics: "Аналитика и прогнозирование",
  content: "Контент и коммуникации",
};

const categoryColors: Record<string, string> = {
  efficiency: "#60a5fa",
  new_process: "#4ade80",
  new_product: "#f59e0b",
  new_feature: "#a78bfa",
  analytics: "#f472b6",
  content: "#34d399",
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Токен недействителен" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date("2026-04-30T23:59:59");
    const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const [
      total,
      todayCount,
      byCategory,
      byDivision,
      byType,
      byStatus,
      recent,
      applicationsByDay,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.application.groupBy({
        by: ["category"],
        _count: true,
      }),
      prisma.application.groupBy({
        by: ["divisionId"],
        _count: true,
      }),
      prisma.application.groupBy({
        by: ["type"],
        _count: true,
      }),
      prisma.application.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { division: true },
      }),
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM Application
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      ` as Promise<Array<{ date: string; count: number }>>,
    ]);

    const divisions = await prisma.division.findMany();
    const divisionMap = new Map(divisions.map((d) => [d.id, d.name]));

    // Calculate cumulative
    let cumulative = 0;
    const byDay = applicationsByDay.map((day) => {
      cumulative += Number(day.count);
      return {
        date: day.date,
        count: Number(day.count),
        cumulative,
      };
    });

    return NextResponse.json({
      total,
      today: todayCount,
      divisionsActive: byDivision.length,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      byDay,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        label: categoryLabels[c.category] || c.category,
        count: c._count,
        color: categoryColors[c.category] || "#6382ff",
      })),
      byDivision: byDivision.map((d) => ({
        divisionId: d.divisionId,
        divisionName: divisionMap.get(d.divisionId) || `Дивизион ${d.divisionId}`,
        count: d._count,
      })).sort((a, b) => b.count - a.count),
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      recent: recent.map((app) => ({
        id: app.id,
        title: app.title,
        applicantName: app.applicantName,
        category: app.category,
        type: app.type,
        status: app.status,
        divisionName: app.division.name,
        createdAt: app.createdAt,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки данных" },
      { status: 500 }
    );
  }
}
