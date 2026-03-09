// Forecast.tsx — Phase 17
'use client'

interface ForecastProps {
  headline: string
  interpretation: string
  contextLine?: string
  patternContext?: string | null
}

export default function Forecast({ headline, interpretation, contextLine, patternContext }: ForecastProps) {
  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-zinc-950 tracking-tight">
        {headline}
      </p>
      <p className="text-base font-normal text-zinc-800 leading-relaxed">
        {interpretation}
      </p>
      {contextLine && (
        <p className="text-sm text-zinc-600 leading-relaxed">
          {contextLine}
        </p>
      )}
      {patternContext && (
        <p className="text-sm text-zinc-500 leading-relaxed italic">
          {patternContext}
        </p>
      )}
    </div>
  )
}
