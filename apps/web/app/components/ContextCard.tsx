'use client'

import { useEffect, useState } from 'react'

const TAGS = [
  { value: 'neutral',       label: 'Neutral' },
  { value: 'work_stress',   label: 'Work stress' },
  { value: 'family_stress', label: 'Family stress' },
  { value: 'travel',        label: 'Travel' },
  { value: 'poor_sleep',    label: 'Poor sleep' },
  { value: 'illness',       label: 'Illness' },
  { value: 'exercise_load', label: 'Exercise load' },
  { value: 'mental_load',   label: 'Mental load' },
] as const

type ContextTag = typeof TAGS[number]['value']

interface ContextCardProps {
  dayKey: string
}

export default function ContextCard({ dayKey }: ContextCardProps) {
  const [selected, setSelected] = useState<ContextTag | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/context')
      .then(r => r.json())
      .then(data => {
        if (data.context?.context_tag) {
          setSelected(data.context.context_tag)
          setSaved(true)
        }
      })
      .catch(() => null)
  }, [dayKey])

  async function handleSelect(tag: ContextTag) {
    if (saving) return
    setSelected(tag)
    setSaving(true)
    setSaved(false)

    try {
      await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_tag: tag }),
      })
      setSaved(true)
    } catch {
      // silent fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="text-xs tracking-[0.25em] uppercase font-mono mb-3" style={{ color: "#2C2C2C" }}>
        Context
      </p>
      <div className="flex flex-wrap gap-2">
        {TAGS.map(tag => {
          const isSelected = selected === tag.value
          return (
            <button
              key={tag.value}
              onClick={() => handleSelect(tag.value)}
              className="text-xs font-mono px-3 py-1.5 rounded-full border transition-all"
              style={{
                background:   isSelected ? '#3F3F3F' : 'transparent',
                color:        isSelected ? '#e9e6e0' : '#6B6B6B',
                borderColor:  isSelected ? '#3F3F3F' : '#c4c1bb',
              }}
            >
              {tag.label}
            </button>
          )
        })}
      </div>
      {saved && (
        <p className="text-xs font-mono mt-2" style={{ color: "#6B6B6B" }}>Saved</p>
      )}
    </div>
  )
}
