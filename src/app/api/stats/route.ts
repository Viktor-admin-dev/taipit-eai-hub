import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [applicationsCount, divisionsWithApps, config] = await Promise.all([
      prisma.application.count(),
      prisma.application.groupBy({
        by: ["divisionId"],
        _count: true,
      }),
      prisma.siteConfig.findMany({
        where: {
          key: {
            in: ["contest_start_date", "contest_end_date"],
          },
        },
      }),
    ]);

    const endDateConfig = config.find((c) => c.key === "contest_end_date");
    const startDateConfig = config.find((c) => c.key === "contest_start_date");

    const endDate = endDateConfig
      ? new Date(endDateConfig.value)
      : new Date("2026-04-30T23:59:59");
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      applicationsCount,
      divisionsWithApps: divisionsWithApps.length,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      contestStartDate: startDateConfig?.value || new Date().toISOString(),
      contestEndDate: endDateConfig?.value || "2026-04-30T23:59:59.000Z",
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        applicationsCount: 0,
        divisionsWithApps: 0,
        daysRemaining: 0,
      },
      { status: 500 }
    );
  }
}
