"use client";

/**
 * StatusUpdateModal
 *
 * The Q10 feature: generate a Teams-ready or formal status update for
 * any product vertical or the overall portfolio in 2 clicks.
 */

import React, { useState, useEffect } from "react";
import { PRODUCT_VERTICALS, PLATFORM_VERTICALS, type VerticalId, type StatusUpdateFormat } from "@/lib/control-tower/verticals";

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: StatusUpdateFormat; label: string; desc: string }[] = [
  { value: "teams_quick",            label: "Teams Quick Update",      desc: "Copy-paste ready for a Teams message" },
  { value: "business_status_update", label: "Business Status Update",  desc: "Formal stakeholder update using your template" },
  { value: "roadmap_update",         label: "Roadmap Update",          desc: "Roadmap-focused view for business audiences" },
];

export function StatusUpdateModal({ open, onClose }: StatusUpdateModalProps) {
  const [verticalId, setVerticalId] = useState<VerticalId>("overall");
  const [format, setFormat] = useState<StatusUpdateFormat>("teams_quick");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ verticalLabel: string; featureRequestCount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setOutput(null);
      setMeta(null);
      setError(null);
      setCopied(false);
    }
  }, [open]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/control-tower/status-update/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verticalId, format }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Generation failed");
      setOutput(data.output);
      setMeta({ verticalLabel: data.verticalLabel, featureRequestCount: data.featureRequestCount });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Share Status Update</h2>
            <p className="text-sm text-gray-500 mt-0.5">Generate a Teams message or formal update for any vertical</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-4">
          {/* Vertical selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Scope
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVerticalId("overall")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  verticalId === "overall"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                Overall Portfolio
              </button>
            </div>

            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 mb-1.5">Product Verticals</p>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCT_VERTICALS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVerticalId(v.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    verticalId === v.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 mb-1.5">Platform</p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_VERTICALS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVerticalId(v.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    verticalId === v.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`text-left p-3 rounded-lg border text-xs transition-all ${
                    format === f.value
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="font-semibold mb-0.5">{f.label}</div>
                  <div className={format === f.value ? "text-blue-600" : "text-gray-400"}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              "Generate Status Update"
            )}
          </button>
        </div>

        {/* Output */}
        {(output || error) && (
          <div className="flex-1 overflow-auto px-6 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}
            {output && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500">
                    {meta?.verticalLabel} · {meta?.featureRequestCount} tracked items
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      copied
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy for Teams
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono leading-relaxed">
                  {output}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
