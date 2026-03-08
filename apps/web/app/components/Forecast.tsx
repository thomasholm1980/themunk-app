// Forecast.tsx — Phase 10 refactor
// Renders forecast block from decision_v1 contract fields only
// Props: headline, interpretation, contextLine (optional)

// Forecast language constraints
// headline ≤ 55 chars
// interpretation ≤ 90 chars
// contextLine ≤ 110 chars

interface ForecastProps {
  headline: string
  interpretation: string
  contextLine?: string
}

export default function Forecast({ headline, interpretation, contextLine }: ForecastProps) {
  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-zinc-950 tracking-tight">
        {headline}
      </p>
      <p className="text-base font-normal text-zinc-800 leading-relaxed">
        {interpretation}
      </p>
      {contextLine && (
        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
          {contextLine}
        </p>
      )}
    </div>
  )
}
