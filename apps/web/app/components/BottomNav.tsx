'use client'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { id: 'idag',      label: 'Today',     href: '/check-in' },
  { id: 'monster',   label: 'Pattern',   href: '/monster'  },
  { id: 'bibliotek', label: 'Library',   href: '/library'  },
  { id: 'aria',      label: 'Aria',      href: '/munk'     },
]

// Routes where the bottom nav should be HIDDEN.
// /munk is intentionally hidden so Aria sessions feel uninterrupted.
const HIDDEN_ON = ['/munk', '/demo']

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  if (HIDDEN_ON.includes(pathname)) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center px-8"
      style={{
        height: '72px',
        background: 'rgba(8,18,16,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        zIndex: 50
      }}
    >
      {NAV_ITEMS.map(tab => {
        const active = pathname === tab.href
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className="flex flex-col items-center gap-1"
          >
            {active ? (
              <div style={{ width: '4px', height: '4px', background: '#D4AF37', borderRadius: '50%', marginBottom: '2px' }} />
            ) : (
              <div style={{ width: '4px', height: '4px', marginBottom: '2px' }} />
            )}
            <span
              className="text-[11px] tracking-[0.18em] uppercase"
              style={{
                color: active ? '#D4AF37' : 'rgba(255,255,255,0.30)',
                fontWeight: active ? 500 : 400,
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
