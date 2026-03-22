"use client";

import React, { useMemo, useState } from "react";
import type { StrategyDocumentSummary } from "@/lib/types";

function renderSimpleMarkdown(body: string) {
  return body
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="mt-6 text-2xl font-semibold tracking-tight text-ink first:mt-0">
            {line.replace(/^#\s+/, "")}
          </h2>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="mt-6 text-xl font-semibold tracking-tight text-ink">
            {line.replace(/^##\s+/, "")}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="mt-5 text-base font-semibold text-ink">
            {line.replace(/^###\s+/, "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-5 list-disc text-sm leading-7 text-ink/75">
            {line.replace(/^-\s+/, "")}
          </li>
        );
      }
      return (
        <p key={index} className="mt-3 text-sm leading-7 text-ink/75">
          {line}
        </p>
      );
    });
}

export function StrategyDocumentViewer({ documents }: { documents: StrategyDocumentSummary[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(documents[0]?.slug ?? null);

  const activeDoc = useMemo(() => documents.find((doc) => doc.slug === activeSlug) ?? documents[0] ?? null, [documents, activeSlug]);

  if (!documents.length || !activeDoc) {
    return (
      <div className="rounded-[24px] border border-dashed border-ink/15 bg-white/70 p-6 text-sm text-ink/60">
        No strategy documents available.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-[28px] border border-ink/10 bg-white/85 p-4 shadow-card backdrop-blur">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">Documents</p>
        <div className="mt-3 space-y-2">
          {documents.map((doc) => {
            const active = doc.slug === activeDoc.slug;
            return (
              <button
                key={doc.slug}
                type="button"
                onClick={() => setActiveSlug(doc.slug)}
                className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${
                  active ? "border-ink bg-ink text-cloud" : "border-ink/10 bg-cloud/70 text-ink/75 hover:bg-cloud"
                }`}
              >
                <div className="text-sm font-semibold tracking-tight">{doc.title}</div>
                <div className={`mt-1 text-[11px] ${active ? "text-cloud/65" : "text-ink/45"}`}>{doc.path}</div>
              </button>
            );
          })}
        </div>
      </aside>

      <article className="rounded-[30px] border border-ink/10 bg-white/88 p-7 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-ink/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">Open document</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{activeDoc.title}</h1>
          </div>
          <div className="text-xs text-ink/45">{activeDoc.path}</div>
        </div>
        <div className="mt-6 space-y-1">{renderSimpleMarkdown(activeDoc.body)}</div>
      </article>
    </div>
  );
}
