import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "/app/uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 3;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "Файлы не выбраны" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Максимум ${MAX_FILES} файла` },
        { status: 400 }
      );
    }

    // Validate all files first
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Файл "${file.name}" превышает 10 МБ` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Файл "${file.name}": допустимы только PDF и изображения (PNG, JPG)` },
          { status: 400 }
        );
      }
    }

    // Ensure upload directory exists (for local dev)
    const uploadDir = process.env.NODE_ENV === "production" ? UPLOAD_DIR : path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const savedFiles: string[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const safeName = sanitizeFilename(file.name);
      const filename = `${timestamp}_${safeName}`;
      const filepath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);
      savedFiles.push(filename);
    }

    return NextResponse.json({ files: savedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки файлов" },
      { status: 500 }
    );
  }
}
