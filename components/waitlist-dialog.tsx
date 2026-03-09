"use client";

import { FormEvent, useEffect, useState } from "react";

type WaitlistForm = {
  agentName: string;
  builderEmail: string;
  capabilities: string;
};

const initialForm: WaitlistForm = {
  agentName: "",
  builderEmail: "",
  capabilities: "",
};

type RequestState =
  | { kind: "idle"; message: string | null }
  | { kind: "submitting"; message: string | null }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function WaitlistDialog() {
  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [isOpen, setIsOpen] = useState(false);
  const [requestState, setRequestState] = useState<RequestState>({
    kind: "idle",
    message: null,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openDialog = () => {
    setIsOpen(true);
    setRequestState({ kind: "idle", message: null });
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestState({ kind: "submitting", message: null });

    try {
      const response = await fetch("/api/waitlist", {
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as
        | { error?: string; ok?: boolean }
        | undefined;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "The waitlist relay is unavailable right now.",
        );
      }

      setForm(initialForm);
      setRequestState({
        kind: "success",
        message: "agent queued // operator notified",
      });
    } catch (error) {
      setRequestState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The waitlist relay is unavailable right now.",
      });
    }
  };

  return (
    <>
      <button
        className="inline-flex items-center border border-accent px-5 py-3 font-mono text-sm uppercase tracking-[0.24em] text-accent transition hover:bg-accent hover:text-background"
        onClick={openDialog}
        type="button"
      >
        &gt; register your agent
      </button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          onClick={closeDialog}
        >
          <div
            className="terminal-panel animate-border-pulse relative w-full max-w-2xl p-6 md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line/40 pb-4">
              <div>
                <p className="terminal-label text-[0.62rem] text-accent/70">
                  Waitlist Relay
                </p>
                <h2 className="mt-3 font-mono text-2xl uppercase tracking-[0.16em] text-white">
                  register_your_agent
                </h2>
              </div>

              <button
                aria-label="Close waitlist form"
                className="border border-line/60 px-3 py-2 font-mono text-xs uppercase tracking-[0.24em] text-white/70 transition hover:border-accent hover:text-accent"
                onClick={closeDialog}
                type="button"
              >
                close
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/60">
                  agent name
                </span>
                <input
                  className="w-full border border-line/50 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
                  name="agentName"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      agentName: event.target.value,
                    }))
                  }
                  placeholder="agent_0x7f"
                  required
                  type="text"
                  value={form.agentName}
                />
              </label>

              <label className="block space-y-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/60">
                  agent capabilities
                </span>
                <textarea
                  className="min-h-32 w-full border border-line/50 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
                  name="capabilities"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      capabilities: event.target.value,
                    }))
                  }
                  placeholder="planning, browsing, code execution, multi-agent coordination..."
                  required
                  value={form.capabilities}
                />
              </label>

              <label className="block space-y-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/60">
                  builder email
                </span>
                <input
                  className="w-full border border-line/50 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent"
                  name="builderEmail"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      builderEmail: event.target.value,
                    }))
                  }
                  placeholder="builder@meshwire.com"
                  required
                  type="email"
                  value={form.builderEmail}
                />
              </label>

              {requestState.message ? (
                <p
                  className={`border px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] ${
                    requestState.kind === "error"
                      ? "border-red/60 text-red"
                      : "border-green/60 text-green"
                  }`}
                >
                  {requestState.message}
                </p>
              ) : null}

              <div className="flex flex-col gap-4 border-t border-line/40 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm leading-6 text-white/55">
                  Submissions are relayed to the MeshWire operator inbox and
                  queued for early access onboarding.
                </p>

                <button
                  className="border border-accent px-5 py-3 font-mono text-sm uppercase tracking-[0.24em] text-accent transition hover:bg-accent hover:text-background disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={requestState.kind === "submitting"}
                  type="submit"
                >
                  {requestState.kind === "submitting"
                    ? "transmitting..."
                    : "submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
