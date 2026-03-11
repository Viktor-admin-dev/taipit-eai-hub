import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { buildNewsEmailHtml } from "@/lib/email";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postId = parseInt(searchParams.get("postId") || "");

  if (isNaN(postId)) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const post = await prisma.newsPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
  });

  const html = buildNewsEmailHtml({
    title: post.title,
    body: post.body,
    cta: post.cta,
  });

  return NextResponse.json({
    html,
    subject: post.title,
    recipients: subscribers.map((s) => s.email),
    recipientCount: subscribers.length,
    resendConfigured: !!process.env.RESEND_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, subject } = await request.json();

  const post = await prisma.newsPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "Нет подписчиков" }, { status: 400 });
  }

  const html = buildNewsEmailHtml({
    title: post.title,
    body: post.body,
    cta: post.cta,
  });

  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const success = await sendEmail({
      to: subscriber.email,
      subject: subject || post.title,
      html,
      recipientType: "author",
    });
    if (success) sent++;
    else failed++;
  }

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
