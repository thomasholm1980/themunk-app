'use client';

import { useEffect, useState } from 'react';

type LongitudinalStatus =
  | 'insufficient_data'
  | 'volatile'
  | 'accumulating_strain'
  | 'improving_recovery'
  | 'stable';

type TrajectoryDirection = 'improving' | 'declining' | 'neutral' | 'unknown';

interface SummaryRow {
  window_type: '7d' | '14d';
  status: LongitudinalStatus;
  confidence: 'low' | 'medium' | 'high';
  days_available: number;
  driver_codes: string[];
  trajectory: TrajectoryDirection;
  summary_code: LongitudinalStatus;
}

interface SummaryResponse {
  day_key: string;
  windows: {
    '7d'?: SummaryRow;
    '14d'?: SummaryRow;
  };
}

const STATUS_LABEL: Record<LongitudinalStatus, string> = {
  insufficient_data:   'Insufficient data',
  volatile:            'Volatile',
  accumulating_strain: 'Accumulating strain',
  improving_recovery:  'Improving recovery',
  stable:              'Stable',
};

const STATUS_COLOR: Record<LongitudinalStatus, string> = {
  insufficient_data:   'text-zinc-500',
  volatile:            'text-red-400',
  accumulating_strain: 'text-yellow-400',
  improving_recovery:  'text-teal-400',
  stable:              'text-green-400',
};

const TRAJECTORY_LABEL: Record<TrajectoryDirection, string> = {
  improving: '↑ Improving',
  declining: '↓ Declining',
  neutral:   '→ Neutral',
  unknown:   '– Unknown',
};

const TRAJECTORY_COLOR: Record<TrajectoryDirection, string> = {
  improving: 'text-teal-400',
  declining: 'text-red-400',
  neutral:   'text-zinc-400',
  unknown:   'text-zinc-500',
};

const DRIVER_LABEL: Record<string, string> = {
  LOW_DATA_COVERAGE:      'Low coverage',
  HIGH_STATE_VARIANCE:    'High variance',
  REPEATED_RED_DAYS:      'Repeated red days',
  HRV_DECLINING:          'HRV declining',
  HRV_RECOVERING:         'HRV recovering',
  SLEEP_DECLINING:        'Sleep declining',
  SLEEP_RECOVERING:       'Sleep recovering',
  READINESS_LOW:          'Readiness low',
  READINESS_HIGH:         'Readiness high',
  RESTING_HR_ELEVATED:    'HR elevated',
  GREEN_STREAK:           'Green streak',
  MIXED_SIGNALS:          'Mixed signals',
  PROTOCOL_LOW_ADHERENCE: 'Low adherence',
  STATE_IMPROVING:        'State improving',
  STATE_DECLINING:        'State declining',
};

const CONFIDENCE_LABEL: Record<string, string> = {
  low:    'Building baseline',
  medium: 'Medium confidence',
  high:   'High confidence',
};

function WindowCard({ row }: { row: SummaryRow }) {
  const isInsufficient = row.status === 'insufficient_data';
  return (
    <div className="border border-zinc-800 rounded-lg p-4 space-y-3 bg-zinc-950">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
          {row.window_type === '7d' ? '7-day window' : '14-day window'}
        </span>
        <span className="text-zinc-600 text-xs">
          {row.days_available} day{row.days_available !== 1 ? 's' : ''}
        </span>
      </div>
      <div className={`text-lg font-semibold ${STATUS_COLOR[row.status]}`}>
        {STATUS_LABEL[row.status]}
      </div>
      <div className="text-zinc-500 text-xs">
        {CONFIDENCE_LABEL[row.confidence] ?? 'Building baseline'}
      </div>
      {isInsufficient ? (
        <p className="text-zinc-600 text-xs">
          Minimum data threshold not yet reached.
        </p>
      ) : (
        row.driver_codes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {row.driver_codes.map((code) => (
              <span
                key={code}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
              >
                {DRIVER_LABEL[code] ?? code}
              </span>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function LongitudinalPanel() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/longitudinal/summary')
      .then((r) => r.json())
      .then((json) => {
        if (json.error)   { setError(json.error); return; }
        if (!json.windows) { setSummary(null); return; }
        setSummary(json as SummaryResponse);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-zinc-500 text-sm py-6 text-center font-mono">Loading trajectory data...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm py-4 font-mono">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="text-zinc-600 text-sm py-6 text-center">No trajectory data available yet.</div>;
  }

  const w7  = summary.windows['7d'];
  const w14 = summary.windows['14d'];
  const trajectory = w7?.trajectory ?? w14?.trajectory ?? 'unknown';
  const summaryCode = w7?.summary_code ?? 'insufficient_data';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-zinc-200 text-sm font-mono uppercase tracking-widest">Trajectory</h2>
        <span className={`text-sm font-mono ${TRAJECTORY_COLOR[trajectory]}`}>
          {TRAJECTORY_LABEL[trajectory]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {w7  && <WindowCard row={w7} />}
        {w14 && <WindowCard row={w14} />}
        {!w7 && !w14 && (
          <p className="text-zinc-600 text-xs col-span-2">No window data available.</p>
        )}
      </div>

      {summaryCode === 'insufficient_data' && (
        <p className="text-zinc-600 text-xs text-center pt-1">
          Trajectory classification requires a minimum of 5 consecutive check-in days.
        </p>
      )}
    </section>
  );
}
