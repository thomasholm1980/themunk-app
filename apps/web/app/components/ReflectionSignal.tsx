// apps/web/app/components/ReflectionSignal.tsx
// Reflection Signal v1 — single tap, no text input
// Low emphasis. Appears after DailyBrief.
// v1.0.0

"use client";

import { useState } from "react";

type ReflectionAccuracy = "ACCURATE" | "SOMEWHAT_ACCURATE" | "NOT_ACCURATE";

interface ReflectionSignalProps {
  dayKey: string;
  userId: string;
}

const OPTIONS: { value: ReflectionAccuracy; label: string }[] = [
  { value: "ACCURATE",          label: "Accurate" },
  { value: "SOMEWHAT_ACCURATE", label: "Somewhat" },
  { value: "NOT_ACCURATE",      label: "Not accurate" },
];

export default function ReflectionSignal({ dayKey, userId }: ReflectionSignalProps) {
  const [selected, setSelected] = useState<ReflectionAccuracy | null>(null);
  const [status, setStatus]     = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSelect(accuracy: ReflectionAccuracy) {
    if (status === "saving") return;
    setSelected(accuracy);
    setStatus("saving");

    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ day_key: dayKey, accuracy }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs tracking-[0.2em] uppercase text-zinc-600">
        How does this feel today?
      </p>

      <div className="flex gap-2">
        {OPTIONS.map(({ value, label }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              disabled={status === "saving"}
              className={`
                flex-1 py-2 px-3 text-xs border rounded-sm transition-colors
                ${isSelected
                  ? "border-zinc-400 text-zinc-100 bg-zinc-800"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                }
                disabled:opacity-40
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {status === "saved" && (
        <p className="text-xs text-zinc-600">Registered.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-800">Could not save. Try again.</p>
      )}
    </div>
  );
}
