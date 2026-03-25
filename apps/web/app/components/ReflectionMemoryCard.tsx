"use client";
// ReflectionMemoryCard — Reflection Memory V1
// Three quick inputs. Autosave on each selection.
// Memory input only — does NOT affect state engine.

import { useEffect, useState } from "react";
import { logMorningEvent } from "../../lib/telemetry";

type BodyFeeling   = "rolig" | "urolig" | "tung" | "presset";
type BriefAccuracy = "ja" | "delvis" | "nei";
type DayDirection  = "bedre" | "likt" | "verre";

interface ReflectionState {
  body_feeling?:   BodyFeeling;
  brief_accuracy?: BriefAccuracy;
  day_direction?:  DayDirection;
}

const BODY_OPTIONS: { value: BodyFeeling; label: string }[] = [
  { value: "rolig",   label: "Rolig"   },
  { value: "urolig",  label: "Urolig"  },
  { value: "tung",    label: "Tung"    },
  { value: "presset", label: "Presset" },
];

const ACCURACY_OPTIONS: { value: BriefAccuracy; label: string }[] = [
  { value: "ja",     label: "Ja"     },
  { value: "delvis", label: "Delvis" },
  { value: "nei",    label: "Nei"    },
];

const DIRECTION_OPTIONS: { value: DayDirection; label: string }[] = [
  { value: "bedre", label: "Bedre" },
  { value: "likt",  label: "Likt"  },
  { value: "verre", label: "Verre" },
];

function OptionRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className="px-4 py-2 rounded-xl text-xs transition-all"
          style={{
            background: selected === opt.value
              ? "rgba(255,255,255,0.10)"
              : "rgba(255,255,255,0.04)",
            border: selected === opt.value
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(255,255,255,0.07)",
            color: selected === opt.value ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.40)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface Props {
  dayKey: string;
}

export default function ReflectionMemoryCard({ dayKey }: Props) {
  const [state,   setState]   = useState<ReflectionState>({});
  const [saved,   setSaved]   = useState(false);
  const [loaded,  setLoaded]  = useState(false);

  // Load existing reflection on mount
  useEffect(() => {
    logMorningEvent("reflection_opened" as any);
    fetch("/api/reflection/today")
      .then((r) => r.json())
      .then((json) => {
        if (json.reflection) {
          setState({
            body_feeling:   json.reflection.body_feeling   ?? undefined,
            brief_accuracy: json.reflection.brief_accuracy ?? undefined,
            day_direction:  json.reflection.day_direction  ?? undefined,
          });
          setSaved(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function save(patch: Partial<ReflectionState>) {
    const next = { ...state, ...patch };
    setState(next);

    const isUpdate = saved;
    logMorningEvent("reflection_option_selected" as any, { ...patch });

    try {
      const res = await fetch("/api/reflection/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_key: dayKey, ...next }),
      });
      if (res.ok) {
        setSaved(true);
        logMorningEvent(
          isUpdate ? ("reflection_updated" as any) : ("reflection_saved" as any)
        );
      }
    } catch {
      // Autosave failure is silent — never blocks UI
    }
  }

  if (!loaded) return null;

  return (
    <div className="w-full flex flex-col gap-4">

      {/* Q1 */}
      <div className="flex flex-col gap-2 items-center">
        <div className="text-xs tracking-[0.2em] uppercase text-[rgba(255,255,255,0.28)]">
          Hvordan kjentes kroppen i dag?
        </div>
        <OptionRow
          options={BODY_OPTIONS}
          selected={state.body_feeling}
          onSelect={(v) => save({ body_feeling: v })}
        />
      </div>

      {/* Q2 */}
      <div className="flex flex-col gap-2 items-center">
        <div className="text-xs tracking-[0.2em] uppercase text-[rgba(255,255,255,0.28)]">
          Traff dagens stressvurdering?
        </div>
        <OptionRow
          options={ACCURACY_OPTIONS}
          selected={state.brief_accuracy}
          onSelect={(v) => save({ brief_accuracy: v })}
        />
      </div>

      {/* Q3 */}
      <div className="flex flex-col gap-2 items-center">
        <div className="text-xs tracking-[0.2em] uppercase text-[rgba(255,255,255,0.28)]">
          Hvordan utviklet dagen seg?
        </div>
        <OptionRow
          options={DIRECTION_OPTIONS}
          selected={state.day_direction}
          onSelect={(v) => save({ day_direction: v })}
        />
      </div>

      {/* Saved indicator */}
      {saved && (
        <div className="text-xs text-center text-[rgba(255,255,255,0.25)] tracking-[0.2em] uppercase">
          Lagret
        </div>
      )}

    </div>
  );
}
