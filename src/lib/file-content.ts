import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "/app/uploads";

type ImageMediaType = "image/png" | "image/jpeg" | "image/gif" | "image/webp";

interface DocumentBlock {
  type: "document";
  source: {
    type: "base64";
    media_type: "application/pdf";
    data: string;
  };
}

interface ImageBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: ImageMediaType;
    data: string;
  };
}

type ContentBlock = DocumentBlock | ImageBlock;

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

export async function buildFileContentBlocks(
  filesUrls: string | null
): Promise<ContentBlock[]> {
  if (!filesUrls) return [];

  let filenames: string[];
  try {
    filenames = JSON.parse(filesUrls);
  } catch {
    return [];
  }

  if (!Array.isArray(filenames) || filenames.length === 0) return [];

  const uploadDir =
    process.env.NODE_ENV === "production"
      ? UPLOAD_DIR
      : path.join(process.cwd(), "uploads");

  const blocks: ContentBlock[] = [];

  for (const filename of filenames) {
    // Safety: skip anything with path traversal
    if (
      typeof filename !== "string" ||
      filename.includes("..") ||
      filename.includes("/")
    )
      continue;

    try {
      const filepath = path.join(uploadDir, filename);
      const buffer = await readFile(filepath);
      const base64 = buffer.toString("base64");
      const ext = path.extname(filename).toLowerCase();

      if (ext === ".pdf") {
        blocks.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64,
          },
        });
      } else if (IMAGE_EXTENSIONS.includes(ext)) {
        const mediaType: ImageMediaType =
          ext === ".png" ? "image/png" : "image/jpeg";
        blocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64,
          },
        });
      }
    } catch (err) {
      console.error(`Failed to read file ${filename}:`, err);
    }
  }

  return blocks;
}
