"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client-api";
import { EmptyState } from "@/components/ui";
import type { ActionModuleDefinition, ModuleActionDefinition } from "@/lib/types";

function initialArgs(action: ModuleActionDefinition | undefined): Record<string, string> {
  if (!action?.params) return {};
  return action.params.reduce<Record<string, string>>((acc, param) => {
    if (param.default !== undefined) {
      acc[param.name] = Array.isArray(param.default)
        ? param.default.join(", ")
        : String(param.default);
    } else {
      acc[param.name] = "";
    }
    return acc;
  }, {});
}

function coerceValue(type: string, raw: string): unknown {
  if (type === "number") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (type === "boolean") {
    return raw.toLowerCase() === "true";
  }

  if (type === "array") {
    return raw
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return raw;
}

export default function ActionsPage() {
  const [modules, setModules] = useState<ActionModuleDefinition[]>([]);
  const [moduleId, setModuleId] = useState<string>("");
  const [actionId, setActionId] = useState<string>("");
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await api.getModules();
      if (!response.ok || !response.data) {
        setMessage(response.error?.message ?? "Unable to load modules.");
        return;
      }

      setModules(response.data);
      if (response.data[0]) {
        setModuleId(response.data[0].id);
        const firstAction = response.data[0].actions[0];
        if (firstAction) {
          setActionId(firstAction.id);
          setArgs(initialArgs(firstAction));
        }
      }
    };

    void load();
  }, []);

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === moduleId) ?? null,
    [modules, moduleId]
  );

  const selectedAction = useMemo(
    () => selectedModule?.actions.find((action) => action.id === actionId) ?? null,
    [selectedModule, actionId]
  );

  const handleActionChange = (nextActionId: string) => {
    setActionId(nextActionId);
    const action = selectedModule?.actions.find((item) => item.id === nextActionId);
    setArgs(initialArgs(action));
  };

  const runAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedModule || !selectedAction) return;

    setRunning(true);

    const payload: Record<string, unknown> = {};
    for (const param of selectedAction.params ?? []) {
      const raw = args[param.name] ?? "";
      if (!raw && !param.required) continue;
      if (!raw && param.required) {
        setRunning(false);
        setMessage(`${param.name} is required.`);
        return;
      }

      payload[param.name] = coerceValue(param.type, raw);
    }

    const response = await api.runModuleAction(selectedModule.id, selectedAction.id, payload);

    if (!response.ok) {
      setMessage(response.error?.message ?? "Action failed.");
      setRunning(false);
      return;
    }

    setMessage(`Executed via ${response.source ?? "fallback"}.`);
    setResult(JSON.stringify(response.data ?? {}, null, 2));
    setRunning(false);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <aside className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Action modules</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Declarative module runner</h2>
        <p className="mt-2 text-sm text-ink/65">
          Inspired by modular skill manifests. Add new module JSON files and actions become available automatically.
        </p>

        {modules.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No modules found" subtitle="Create module.json files under web/modules." />
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {modules.map((module) => (
              <li key={module.id}>
                <button
                  type="button"
                  onClick={() => {
                    setModuleId(module.id);
                    const firstAction = module.actions[0];
                    if (firstAction) {
                      setActionId(firstAction.id);
                      setArgs(initialArgs(firstAction));
                    }
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    module.id === moduleId
                      ? "border-ink bg-ink text-cloud"
                      : "border-ink/15 bg-cloud/70 text-ink hover:border-ink/40"
                  }`}
                >
                  <p className="font-semibold">{module.name}</p>
                  <p className={`text-xs ${module.id === moduleId ? "text-cloud/75" : "text-ink/60"}`}>{module.version}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="space-y-6 rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-panel">
        {!selectedModule || !selectedAction ? (
          <EmptyState title="Pick a module action" subtitle="Select a module and action to execute." />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Action execution</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedAction.name}</h2>
                <p className="mt-2 text-sm text-ink/65">{selectedAction.description}</p>
              </div>

              <select
                value={selectedAction.id}
                onChange={(event) => handleActionChange(event.target.value)}
                className="rounded-xl border border-ink/20 bg-cloud px-3 py-2 text-sm"
              >
                {selectedModule.actions.map((action) => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </select>
            </div>

            <form className="space-y-4" onSubmit={runAction}>
              {(selectedAction.params ?? []).map((param) => (
                <label key={param.name} className="block space-y-1">
                  <span className="text-sm font-semibold text-ink">
                    {param.name}
                    {param.required ? " *" : ""}
                  </span>
                  <p className="text-xs text-ink/60">{param.description}</p>
                  {param.type === "boolean" ? (
                    <select
                      value={args[param.name] || "false"}
                      onChange={(event) => setArgs((current) => ({ ...current, [param.name]: event.target.value }))}
                      className="w-full rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm"
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  ) : param.type === "array" ? (
                    <textarea
                      value={args[param.name] ?? ""}
                      onChange={(event) => setArgs((current) => ({ ...current, [param.name]: event.target.value }))}
                      placeholder="value one, value two"
                      className="min-h-24 w-full rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm"
                    />
                  ) : (
                    <input
                      type={param.type === "number" ? "number" : "text"}
                      value={args[param.name] ?? ""}
                      onChange={(event) => setArgs((current) => ({ ...current, [param.name]: event.target.value }))}
                      className="w-full rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm"
                    />
                  )}
                </label>
              ))}

              <button
                type="submit"
                disabled={running}
                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-cloud disabled:opacity-60"
              >
                {running ? "Running..." : "Run action"}
              </button>
            </form>

            {message && <p className="text-sm text-ink/70">{message}</p>}

            {result && (
              <div className="rounded-2xl border border-ink/10 bg-cloud/70 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate">Result</p>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-ink/80">{result}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
