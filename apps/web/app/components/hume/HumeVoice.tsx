'use client'
import { useEffect, useRef, useState } from 'react'

type EmotionScore = {
  name: string
  score: number
}

type HumeState = 'idle' | 'connecting' | 'listening' | 'processing' | 'error'

interface Props {
  onEmotionDetected: (emotions: EmotionScore[]) => void
  onTranscript: (text: string) => void
}

export default function HumeVoice({ onEmotionDetected, onTranscript }: Props) {
  const [state, setState] = useState<HumeState>('idle')
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  async function startSession() {
    setState('connecting')
    try {
      // Fetch access token from our API
      const res = await fetch('/api/hume/token')
      const { token } = await res.json()

      // Connect to Hume EVI WebSocket
      const ws = new WebSocket(
        `wss://api.hume.ai/v0/evi/chat?access_token=${token}`
      )
      wsRef.current = ws

      ws.onopen = () => {
        setState('listening')
        startMicrophone()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'user_message') {
          onTranscript(data.message?.content ?? '')
        }
        
        console.log('[Hume] message received:', data.type, JSON.stringify(data).slice(0, 200))
        if (data.type === 'assistant_message') {
          const emotions: EmotionScore[] = data.models?.prosody?.scores
            ? Object.entries(data.models.prosody.scores)
                .map(([name, score]) => ({ name, score: score as number }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
            : []
          if (emotions.length > 0) onEmotionDetected(emotions)
        }
      }

      ws.onerror = () => {
        setState('error')
        setError('Connection failed')
      }

      ws.onclose = () => {
        setState('idle')
      }

    } catch (err) {
      setState('error')
      setError('Could not start session')
    }
  }

  async function startMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && e.data.size > 0) {
        e.data.arrayBuffer().then(buffer => {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
          wsRef.current?.send(JSON.stringify({
            type: 'audio_input',
            data: base64
          }))
        })
      }
    }

    recorder.start(100) // Send every 100ms
  }

  function stopSession() {
    mediaRecorderRef.current?.stop()
    wsRef.current?.close()
    setState('idle')
  }

  const stateLabel = {
    idle: 'Start voice session',
    connecting: 'Connecting...',
    listening: 'Listening — tap to stop',
    processing: 'Processing...',
    error: error ?? 'Error'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <button
        onClick={state === 'idle' ? startSession : stopSession}
        disabled={state === 'connecting' || state === 'processing'}
        style={{
          background: state === 'listening' ? 'rgba(212,55,55,0.90)' : '#D4AF37',
          color: '#0d1a15',
          border: 'none',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          fontSize: '28px',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s',
          boxShadow: state === 'listening' ? '0 0 20px rgba(212,55,55,0.40)' : '0 0 20px rgba(212,175,55,0.30)'
        }}
      >
        {state === 'listening' ? '⏹' : '🎙'}
      </button>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', letterSpacing: '0.1em' }}>
        {stateLabel[state]}
      </p>
    </div>
  )
}
