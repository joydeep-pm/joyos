"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await api.getSettings();
      if (response.ok && response.data) {
        setSettings(response.data);
      } else {
        setMessage(response.error?.message ?? "Unable to load settings.");
      }
    };

    void load();
  }, []);

  return (
    <section className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Settings</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Local workspace configuration</h2>
      <p className="mt-2 text-sm text-ink/65">
        This MVP runs local-first. Paths below show where markdown data is read and written.
      </p>

      {message && <p className="mt-4 text-sm text-rose-700">{message}</p>}

      {!settings ? (
        <p className="mt-4 text-sm text-ink/65">Loading configuration...</p>
      ) : (
        <dl className="mt-5 grid gap-3 text-sm">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
              <dt className="font-semibold text-ink">{key}</dt>
              <dd className="mono mt-1 break-all text-xs text-ink/70">{value === null ? "null" : String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
