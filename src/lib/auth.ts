import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "taipit-eai-hub-secret-key-2026";

interface ForumTokenPayload {
  userId: number;
  role: string;
}

export function verifyForumToken(request: NextRequest): ForumTokenPayload | null {
  try {
    const token = request.cookies.get("forum_token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as ForumTokenPayload;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

export function verifyAdminToken(request: NextRequest): boolean {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) return false;
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
