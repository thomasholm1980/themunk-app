'use client'
import { useRef, useState } from 'react'

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
  const streamRef = useRef<MediaStream | null>(null)

  async function startSession() {
    setState('connecting')
    try {
      const res = await fetch('/api/hume/token')
      const { api_key } = await res.json()

      const ws = new WebSocket(
        `wss://api.hume.ai/v0/evi/chat?api_key=${api_key}&config_id=ffbf28a8-1554-4344-add7-1090ce18b206`
      )
      wsRef.current = ws

      ws.onopen = () => {
        setState('listening')
        console.log('[Hume] WebSocket connected')
        console.log('[Hume] connected, using api_key + config_id from URL')
        startMicrophone()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('[Hume] received:', data.type)

        if (data.type === 'chat_metadata') {
          console.log('[Hume] chat_id:', data.chat_id)
        }

        if (data.type === 'user_message') {
          onTranscript(data.message?.content ?? '')
          console.log('[Hume] user said:', data.message?.content)
        }

        if (data.type === 'assistant_message') {
          console.log('[Hume] assistant:', data.message?.content)
          const emotions: EmotionScore[] = data.models?.prosody?.scores
            ? Object.entries(data.models.prosody.scores)
                .map(([name, score]) => ({ name, score: score as number }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
            : []
          console.log('[Hume] top emotions:', emotions)
          if (emotions.length > 0) onEmotionDetected(emotions)
        }

        if (data.type === 'audio_output') {
          // Audio playback - ignore for now, focus on emotions
        }

        if (data.type === 'error') {
          console.error('[Hume] server error:', data)
        }
      }

      ws.onerror = (e) => {
        console.error('[Hume] WebSocket error:', e)
        setState('error')
        setError('Connection failed')
      }

      ws.onclose = (e) => {
        console.log('[Hume] WebSocket closed:', e.code, e.reason)
        setState('idle')
      }

    } catch (err) {
      console.error('[Hume] session start failed:', err)
      setState('error')
      setError('Could not start session')
    }
  }

  async function startMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && e.data.size > 0) {
          e.data.arrayBuffer().then(buffer => {
            const bytes = new Uint8Array(buffer)
            const base64 = btoa(String.fromCharCode(...bytes))
            wsRef.current?.send(JSON.stringify({
              type: 'audio_input',
              data: base64
            }))
          })
        }
      }

      recorder.start(100)
      console.log('[Hume] microphone started (webm, 100ms chunks)')

    } catch (err) {
      console.error('[Hume] microphone error:', err)
      setState('error')
      setError('Microphone access failed')
    }
  }

  function stopSession() {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    wsRef.current?.close()
    setState('idle')
    console.log('[Hume] session stopped')
  }

  const stateLabel = {
    idle: 'Start voice session',
    connecting: 'Connecting...',
    listening: 'Listening \u2014 tap to stop',
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
        {state === 'listening' ? '\u23F9' : '\uD83C\uDF99'}
      </button>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', letterSpacing: '0.1em' }}>
        {stateLabel[state]}
      </p>
    </div>
  )
}
