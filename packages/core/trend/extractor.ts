// packages/core/trend/extractor.ts
// Deterministic trend computation. No LLM.

import { DayRecord, TrendReport, WindowStats, Direction } from "../types";
import {
  WINDOWS, MIN_COVERAGE, TREND_SIGNALS,
  SLOPE_IMPROVING, SLOPE_DECLINING,
} from "./config";

export function computeTrendReport(
  records: DayRecord[],
  anchorDate: string,
): TrendReport {
  const anchor = new Date(anchorDate);
  const indexed = indexByDay(records);
  const signals: TrendReport["signals"] = {};

  for (const signal of TREND_SIGNALS) {
    signals[signal] = {};
    for (const window of WINDOWS) {
      const data = extractWindow(indexed, anchor, window, signal);
      signals[signal][`${window}d`] = computeWindowStats(data, window);
    }
  }

  return { trend_version: "1.0", anchor_date: anchorDate, signals };
}

// ---------- internals ----------

function indexByDay(records: DayRecord[]): Map<string, DayRecord[]> {
  const map = new Map<string, DayRecord[]>();
  for (const rec of records) {
    const key = rec.day_key;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(rec);
  }
  return map;
}

function extractWindow(
  indexed: Map<string, DayRecord[]>,
  anchor: Date,
  windowDays: number,
  signal: string,
): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const recs = indexed.get(key) ?? [];
    const val = findSignal(recs, signal);
    if (val !== null) result.push([-i, val]);
  }
  return result;
}

function findSignal(records: DayRecord[], signal: string): number | null {
  const priority = ["recovery_day", "sleep_session", "activity_day"];
  const sorted = [...records].sort(
    (a, b) => priority.indexOf(a.record_type) - priority.indexOf(b.record_type),
  );
  for (const rec of sorted) {
    const val = (rec as unknown as Record<string, unknown>)[signal];
    if (typeof val === "number") return val;
  }
  return null;
}

function computeWindowStats(
  data: Array<[number, number]>,
  windowDays: number,
): WindowStats {
  const coverageDays = data.length;
  const coveragePct  = Math.round((coverageDays / windowDays) * 1000) / 1000;
  const sufficient   = coveragePct >= MIN_COVERAGE;

  if (!sufficient || coverageDays === 0) {
    return { coverage_days: coverageDays, coverage_pct: coveragePct,
             sufficient: false, mean: null, min: null, max: null,
             latest: null, slope_per_day: null, direction: null };
  }

  const values = data.map(([, v]) => v);
  const mean   = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 1000) / 1000;
  const min    = Math.round(Math.min(...values) * 1000) / 1000;
  const max    = Math.round(Math.max(...values) * 1000) / 1000;
  const [, latestVal] = data.reduce((a, b) => Math.abs(a[0]) < Math.abs(b[0]) ? a : b);
  const slope  = olsSlope(data);
  const direction = classifyDirection(slope);

  return { coverage_days: coverageDays, coverage_pct: coveragePct, sufficient: true,
           mean, min, max, latest: Math.round(latestVal * 1000) / 1000,
           slope_per_day: slope !== null ? Math.round(slope * 10000) / 10000 : null,
           direction };
}

function olsSlope(data: Array<[number, number]>): number | null {
  if (data.length < 2) return null;
  const n  = data.length;
  const mx = data.reduce((s, [x]) => s + x, 0) / n;
  const my = data.reduce((s, [, y]) => s + y, 0) / n;
  const num = data.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
  const den = data.reduce((s, [x])    => s + (x - mx) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

function classifyDirection(slope: number | null): Direction | null {
  if (slope === null) return null;
  if (slope >= SLOPE_IMPROVING) return "improving";
  if (slope <= SLOPE_DECLINING) return "declining";
  return "stable";
}
