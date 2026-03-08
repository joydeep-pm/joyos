"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const seedMessage: ChatMessage = {
  role: "assistant",
  content:
    "Assistant ready. Ask: 'daily brief', 'weekly review', 'show drift alerts', 'commit day plan', or 'draft stakeholder update'.",
  timestamp: new Date().toISOString()
};

export function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([seedMessage]);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    "daily brief",
    "weekly review",
    "show drift alerts"
  ]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const send = async (message: string) => {
    const text = message.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

    const response = await api.chatCopilot(text);
    const data = response.data;

    if (!response.ok || !data) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.error?.message ?? "Copilot could not process that request.",
          timestamp: new Date().toISOString()
        }
      ]);
      setBusy(false);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString()
      }
    ]);

    if (data.suggestions?.length) {
      setQuickPrompts(data.suggestions.slice(0, 4));
    }

    setBusy(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-ink/10 bg-ink px-5 py-3 text-sm font-semibold text-cloud shadow-panel transition hover:scale-[1.02]"
      >
        {open ? "Close Copilot" : "Open Copilot"}
      </button>

      {open && (
        <section className="fixed bottom-24 right-5 z-40 flex h-[70vh] w-[min(430px,calc(100vw-2rem))] flex-col rounded-3xl border border-ink/10 bg-white/95 shadow-panel backdrop-blur">
          <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate">Copilot</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">In-app command assistant</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-ink/15 bg-cloud px-3 py-1 text-xs font-semibold text-ink transition hover:bg-ink/10"
              aria-label="Minimize Copilot"
            >
              Minimize
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <article
                key={`${message.timestamp}-${index}`}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  message.role === "assistant" ? "bg-cloud text-ink" : "ml-8 bg-ink text-cloud"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </article>
            ))}
            {busy && <p className="text-xs text-ink/60">Copilot is thinking...</p>}
          </div>

          <div className="border-t border-ink/10 px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  disabled={busy}
                  className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs text-ink transition hover:bg-cloud disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a command"
                className="flex-1 rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-xl bg-mint px-3 py-2 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
