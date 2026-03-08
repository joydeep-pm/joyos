import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/types";

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, data, ...meta });
}

export function fail(status: number, error: ApiError) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function parseCsv(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : undefined;
}
