"use client";
// apps/web/app/components/WeeklyStatePath.tsx
// Weekly State Path — read-only trajectory display

import { useEffect, useState } from "react";

type TrajectoryLabel =
  | "STABLE"
  | "RISING_STRAIN"
  | "RECOVERING"
  | "VOLATILE"
  | "INSUFFICIENT_DATA";

interface Trajectory {
  label: TrajectoryLabel;
  days_observed: number;
  state_path: string[];
}

const DOT_COLOR: Record<string, string> = {
  GREEN:  "bg-emerald-500",
  YELLOW: "bg-yellow-400",
  RED:    "bg-red-500",
};

const INTERPRETATION: Record<TrajectoryLabel, string> = {
  STABLE:            "Your system has been stable this week.",
  RISING_STRAIN:     "Your system has been under increasing strain.",
  RECOVERING:        "Your system appears to be recovering.",
  VOLATILE:          "Your system has been fluctuating this week.",
  INSUFFICIENT_DATA: "The system is still learning your pattern.",
};

export default function WeeklyStatePath() {
  const [trajectory, setTrajectory] = useState<Trajectory | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/trajectory");
        const json = await res.json();
        if (json.trajectory) setTrajectory(json.trajectory);
      } catch {
        // silent — component simply does not render
      }
    }
    load();
  }, []);

  if (!trajectory) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs tracking-[0.25em] uppercase text-zinc-600">
        Weekly State Path
      </p>
      <div className="flex items-center gap-[10px]">
        {trajectory.state_path.map((state, i) => (
          <span
            key={i}
            className={`inline-block w-[9px] h-[9px] rounded-full ${DOT_COLOR[state] ?? "bg-zinc-500"}`}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-600 leading-relaxed">
        {INTERPRETATION[trajectory.label]}
      </p>
    </div>
  );
}
