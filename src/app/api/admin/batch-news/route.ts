import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { generateAndSaveContent } from "@/lib/content-generator";

// POST /api/admin/batch-news
// Generates news posts for all applications that have AI evaluations but no news post yet
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // Find applications that have AI evaluation but no news post
  const existingPosts = await prisma.newsPost.findMany({
    where: { applicationId: { not: null } },
    select: { applicationId: true },
  });
  const postedIds = new Set(existingPosts.map((p) => p.applicationId));

  const applications = await prisma.application.findMany({
    where: { aiEvaluations: { some: {} } },
    select: { id: true },
    orderBy: { id: "asc" },
  });

  const toGenerate = applications.filter((a) => !postedIds.has(a.id));

  if (toGenerate.length === 0) {
    return NextResponse.json({ message: "Все новости уже сгенерированы", count: 0 });
  }

  // Run in background
  (async () => {
    let ok = 0;
    for (const app of toGenerate) {
      const result = await generateAndSaveContent(app.id);
      if (result) {
        ok++;
        console.log(`News generated for #${app.id}: "${result.post.title}"`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    console.log(`Batch news complete: ${ok}/${toGenerate.length}`);
  })().catch(console.error);

  return NextResponse.json({
    message: `Генерация ${toGenerate.length} новостей запущена (~${toGenerate.length * 2} сек)`,
    count: toGenerate.length,
    applicationIds: toGenerate.map((a) => a.id),
  });
}
