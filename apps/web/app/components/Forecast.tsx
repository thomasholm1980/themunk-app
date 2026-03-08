// Forecast.tsx — Phase 10 refactor
// Renders forecast block from decision_v1 contract fields only
// Props: headline, interpretation, contextLine (optional)

interface ForecastProps {
  headline: string
  interpretation: string
  contextLine?: string
}

export default function Forecast({ headline, interpretation, contextLine }: ForecastProps) {
  return (
    <div className="space-y-3">
      <p className="text-2xl font-semibold text-zinc-950 tracking-tight">
        {headline}
      </p>
      <p className="text-base text-zinc-800 leading-relaxed">
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
