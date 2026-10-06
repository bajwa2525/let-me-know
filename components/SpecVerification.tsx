"use client";

import { useState } from "react";

type State = "idle" | "loading" | "done" | "error";

export default function SpecVerification({
  slug,
  category,
}: {
  slug: string;
  category: string;
}) {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function verify() {
    setState("loading");
    try {
      const res = await fetch("/api/verify-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessage(data.result);
      setState("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
      setState("error");
    }
  }

  return (
    <div className="glass mb-10 rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">✨ AI spec check</p>
        <button
          type="button"
          onClick={verify}
          disabled={state === "loading"}
          className="glass shrink-0 rounded-full px-3 py-1.5 text-xs hover:bg-(--overlay-strong) disabled:opacity-50"
        >
          {state === "loading" ? "Checking…" : "Verify with Gemini"}
        </button>
      </div>

      {state === "idle" && (
        <p className="text-xs text-muted">
          Ask Gemini to fact-check these specs against what it knows about the
          real device, in real time.
        </p>
      )}
      {state === "done" && <p className="text-sm leading-relaxed text-muted">{message}</p>}
      {state === "error" && <p className="text-sm text-rose-400">{message}</p>}
    </div>
  );
}
