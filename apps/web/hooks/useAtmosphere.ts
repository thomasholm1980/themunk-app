import { useState, useEffect } from 'react'
type Period = 'morning' | 'day' | 'evening' | 'night'
export interface Atmosphere { period: Period; gradientFrom: string; gradientTo: string; label: string }
function getOsloHour(): number {
  const parts = new Intl.DateTimeFormat('no-NO', { timeZone: 'Europe/Oslo', hour: 'numeric', hour12: false }).formatToParts(new Date())
  const h = parts.find(p => p.type === 'hour')
  return h ? parseInt(h.value, 10) : new Date().getHours()
}
function getPeriod(h: number): Period {
  if (h >= 5 && h < 10) return 'morning'
  if (h >= 10 && h < 17) return 'day'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}
const MAP: Record<Period, Atmosphere> = {
  morning: { period: 'morning', gradientFrom: '#132A13', gradientTo: '#1B3B22', label: 'Morgentåke' },
  day:     { period: 'day',     gradientFrom: '#0A1F0D', gradientTo: '#14331B', label: 'Høylys' },
  evening: { period: 'evening', gradientFrom: '#051206', gradientTo: '#0D1A0D', label: 'Skumring' },
  night:   { period: 'night',   gradientFrom: '#010701', gradientTo: '#050F06', label: 'Midnatt' },
}
export function useAtmosphere(): Atmosphere {
  const [atm, setAtm] = useState<Atmosphere>(() => MAP[getPeriod(getOsloHour())])
  useEffect(() => {
    const id = setInterval(() => {
      const p = getPeriod(getOsloHour())
      setAtm(prev => prev.period === p ? prev : MAP[p])
    }, 60_000)
    return () => clearInterval(id)
  }, [])
  return atm
}
