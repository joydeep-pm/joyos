import fs from "node:fs/promises";
import path from "node:path";
import { getPersonalOsRoot } from "@/lib/path";

function getCacheDir(): string {
  if (process.env.ASSISTANT_CACHE_DIR) {
    return path.resolve(process.env.ASSISTANT_CACHE_DIR);
  }

  // On Vercel (or other serverless), use /tmp as it's the only writable directory
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "/tmp/.cache";
  }

  return path.join(getPersonalOsRoot(), ".cache");
}

export async function ensureAssistantCacheDir(): Promise<string> {
  const cacheDir = getCacheDir();
  await fs.mkdir(cacheDir, { recursive: true });
  return cacheDir;
}

export function getAssistantCachePath(filename: string): string {
  return path.join(getCacheDir(), filename);
}

export async function readJsonFile<T>(filepath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filepath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filepath: string, data: T): Promise<void> {
  await ensureAssistantCacheDir();
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf8");
}

export async function fileStats(filepath: string): Promise<{ mtimeMs: number; size: number } | null> {
  try {
    const stat = await fs.stat(filepath);
    return {
      mtimeMs: stat.mtimeMs,
      size: stat.size
    };
  } catch {
    return null;
  }
}
