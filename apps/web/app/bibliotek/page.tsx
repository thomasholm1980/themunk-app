'use client'

import { useEffect, useState } from 'react'

type LibraryItem = {
  id: string
  url: string
  title: string
  summary: string
  category: 'stress' | 'recovery' | 'focus'
  tags: string[]
  created_at: string
}

type DailyState = 'GREEN' | 'YELLOW' | 'RED' | null

const CATEGORY_LABELS: Record<string, string> = {
  stress: 'Stress',
  recovery: 'Restitusjon',
  focus: 'Fokus',
}

const CATEGORY_PRIORITY: Record<string, Record<string, number>> = {
  RED:    { stress: 0, recovery: 1, focus: 2 },
  YELLOW: { recovery: 0, stress: 1, focus: 2 },
  GREEN:  { focus: 0, recovery: 1, stress: 2 },
}

export default function BibliotekPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [dailyState, setDailyState] = useState<DailyState>(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<string>('alle')

  useEffect(() => {
    fetchState()
    fetchItems()
  }, [])

  async function fetchState() {
    try {
      const res = await fetch('/api/state/today')
      const data = await res.json()
      if (data.state) setDailyState(data.state)
    } catch {}
  }

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/library/items')
      const data = await res.json()
      setItems(data.items ?? [])
    } catch {}
    setLoading(false)
  }

  async function addItem() {
    if (!url.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/library/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setUrl('')
        await fetchItems()
      }
    } catch {}
    setAdding(false)
  }

  function sortedItems() {
    const priority = dailyState ? CATEGORY_PRIORITY[dailyState] : null
    const filtered = filter === 'alle' ? items : items.filter(i => i.category === filter)
    if (!priority) return filtered
    return [...filtered].sort((a, b) => (priority[a.category] ?? 9) - (priority[b.category] ?? 9))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)',
      color: '#f0ebe3',
      fontFamily: 'Georgia, serif',
      paddingBottom: '100px',
    }}>

      {/* Header */}
      <div style={{ padding: '48px 24px 24px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px', fontSize: '11px', letterSpacing: '3px', color: '#D4AF37', textTransform: 'uppercase' }}>
          The Munk
        </p>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 400 }}>Bibliotek</h1>
        {dailyState && (
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#aaa' }}>
            Prioritert for din tilstand i dag
          </p>
        )}
      </div>

      {/* URL input */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{
          background: '#162C27',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', letterSpacing: '1px', color: '#D4AF37', textTransform: 'uppercase' }}>
            Legg til lenke
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '12px',
              background: '#0F1F1C',
              border: '1px solid #2a4a42',
              borderRadius: '8px',
              color: '#f0ebe3',
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              boxSizing: 'border-box',
              marginBottom: '12px',
            }}
          />
          <button
            onClick={addItem}
            disabled={adding || !url.trim()}
            style={{
              width: '100%',
              padding: '14px',
              background: adding ? '#8a7020' : '#D4AF37',
              color: '#0D1A17',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Georgia, serif',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: adding ? 'not-allowed' : 'pointer',
            }}
          >
            {adding ? 'Analyserer...' : 'Lagre og analyser'}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '0 24px 24px', display: 'flex', gap: '8px' }}>
        {['alle', 'stress', 'recovery', 'focus'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px',
              background: filter === cat ? '#D4AF37' : '#162C27',
              color: filter === cat ? '#0D1A17' : '#f0ebe3',
              border: 'none',
              borderRadius: '20px',
              fontFamily: 'Georgia, serif',
              fontSize: '12px',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {cat === 'alle' ? 'Alle' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: '0 24px' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>Laster...</p>
        )}
        {!loading && sortedItems().length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            Ingen lenker ennå. Lim inn en URL over.
          </p>
        )}
        {sortedItems().map((item) => (
          
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#162C27',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '12px',
              borderLeft: '3px solid #D4AF37',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '16px', color: '#f0ebe3', lineHeight: 1.4, flex: 1 }}>
                  {item.title}
                </p>
                <span style={{
                  marginLeft: '12px',
                  padding: '4px 10px',
                  background: '#0F1F1C',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#D4AF37',
                  whiteSpace: 'nowrap',
                  letterSpacing: '1px',
                }}>
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#aaa', lineHeight: 1.6 }}>
                {item.summary}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0a1a16',
        borderTop: '1px solid #1a3330',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '16px 0 24px',
      }}>
        {[
          { label: 'I dag', href: '/check-in' },
          { label: 'Mønster', href: '/monster' },
          { label: 'Bibliotek', href: '/bibliotek' },
        ].map((tab) => (
          <a key={tab.href} href={tab.href} style={{
            color: tab.href === '/bibliotek' ? '#D4AF37' : '#666',
            textDecoration: 'none',
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  )
}