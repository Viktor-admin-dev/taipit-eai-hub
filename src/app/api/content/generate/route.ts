import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { generateAndSaveContent } from "@/lib/content-generator";

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await request.json();

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId обязателен" }, { status: 400 });
  }

  const result = await generateAndSaveContent(applicationId);

  if (!result) {
    return NextResponse.json(
      { error: "Не удалось сгенерировать контент" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
