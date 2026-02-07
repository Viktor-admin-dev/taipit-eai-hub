import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "week";

    let startDate = new Date();
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date("2026-01-01");
    }

    // Get page visits grouped by day
    const visits = await prisma.pageVisit.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get unique visitors per day
    const dailyStats = await prisma.$queryRaw`
      SELECT
        date(createdAt) as date,
        COUNT(DISTINCT visitorHash) as uniqueVisitors,
        COUNT(*) as totalVisits
      FROM PageVisit
      WHERE createdAt >= ${startDate.toISOString()}
      GROUP BY date(createdAt)
      ORDER BY date ASC
    ` as Array<{ date: string; uniqueVisitors: number; totalVisits: number }>;

    // Get popular pages
    const popularPages = await prisma.pageVisit.groupBy({
      by: ["pagePath"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // Get totals
    const totalVisits = await prisma.pageVisit.count({
      where: { createdAt: { gte: startDate } },
    });

    const uniqueVisitorsResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT visitorHash) as count
      FROM PageVisit
      WHERE createdAt >= ${startDate.toISOString()}
    ` as Array<{ count: number }>;

    const uniqueVisitors = Number(uniqueVisitorsResult[0]?.count || 0);

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      totalVisits,
      uniqueVisitors,
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        uniqueVisitors: Number(d.uniqueVisitors),
        totalVisits: Number(d.totalVisits),
      })),
      popularPages: popularPages.map((p) => ({
        path: p.pagePath,
        visits: p._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// Record a page visit
export async function POST(request: NextRequest) {
  try {
    const { pagePath, visitorHash } = await request.json();

    await prisma.pageVisit.create({
      data: {
        pagePath,
        visitorHash,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording visit:", error);
    return NextResponse.json(
      { error: "Failed to record visit" },
      { status: 500 }
    );
  }
}
