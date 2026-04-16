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
  onAssistantMessage?: (text: string) => void
}

// CHANGED: Norwegian error messages mapped from server error codes.
// Keeps UI calm, in Munkens stemme, never exposes technical state to the user.
function norwegianErrorFor(code: string | undefined): string {
  switch (code) {
    case 'quota_exhausted':
      return 'Aria hviler litt nå. Prøv igjen senere.'
    case 'rate_limited':
      return 'Aria trenger et øyeblikk. Prøv igjen om et minutt.'
    case 'auth_failed':
    case 'hume_unavailable':
    case 'hume_not_configured':
    case 'hume_auth_failed':
    case 'no_access_token':
    case 'token_fetch_failed':
      return 'Aria er utilgjengelig akkurat nå.'
    case 'mic_denied':
      return 'Aria trenger tilgang til mikrofonen for å lytte.'
    case 'connection_failed':
    default:
      return 'Aria er utilgjengelig akkurat nå.'
  }
}

export default function HumeVoice({ onEmotionDetected, onTranscript, onAssistantMessage }: Props) {
  const [state, setState] = useState<HumeState>('idle')
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const playbackContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<Array<ArrayBuffer>>([])
  const isPlayingRef = useRef<boolean>(false)

  async function startSession() {
    setState('connecting')
    setError(null) // CHANGED: reset previous error on retry
    try {
      const res = await fetch('/api/hume/token')

      // CHANGED: Read server error code and map to Norwegian before continuing.
      if (!res.ok) {
        let code: string | undefined
        try {
          const body = await res.json()
          code = body?.error
        } catch { /* ignore parse failure */ }
        setState('error')
        setError(norwegianErrorFor(code))
        return
      }

      const { access_token } = await res.json()

      // CHANGED: Guard against missing token even on 200 response.
      if (!access_token) {
        setState('error')
        setError(norwegianErrorFor('no_access_token'))
        return
      }

      const ws = new WebSocket(
        `wss://api.hume.ai/v0/evi/chat?access_token=${access_token}&config_id=ffbf28a8-1554-4344-add7-1090ce18b206`
      )
      wsRef.current = ws

      ws.onopen = () => {
        setState('listening')
        console.log('[Hume] WebSocket connected')
        console.log('[Hume] connected, using access_token + config_id from URL')
        startMicrophone()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('[Hume] received:', data.type)

        if (data.type === 'chat_metadata') {
        }

        if (data.type === 'user_message') {
          onTranscript(data.message?.content ?? '')
        }

        if (data.type === 'assistant_message') {
          const emotions: EmotionScore[] = data.models?.prosody?.scores
            ? Object.entries(data.models.prosody.scores)
                .map(([name, score]) => ({ name, score: score as number }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
            : []
          if (emotions.length > 0) onEmotionDetected(emotions)
          if (onAssistantMessage && data.message?.content) {
            onAssistantMessage(data.message.content)
          }
        }

        if (data.type === 'audio_output' && data.data) {
          try {
            const binaryString = atob(data.data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            audioQueueRef.current.push(bytes.buffer)
            playNextAudio()
          } catch (e) {
            console.error('[Hume] audio decode failed')
          }
        }

        if (data.type === 'error') {
          console.error('[Hume] server error:', data)
        }
      }

      ws.onerror = (e) => {
        console.error('[Hume] WebSocket error:', e)
        setState('error')
        setError(norwegianErrorFor('connection_failed')) // CHANGED: Norwegian
      }

      ws.onclose = (e) => {
        console.log('[Hume] WebSocket closed:', e.code, e.reason)
        setState('idle')
      }

    } catch (err) {
      console.error('[Hume] session start failed:', err)
      setState('error')
      setError(norwegianErrorFor('connection_failed')) // CHANGED: Norwegian
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

      let mimeType = 'audio/webm'
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        }
      }
      console.log('[Hume] using mimeType:', mimeType)
      const recorder = new MediaRecorder(stream, { mimeType })
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
      setError(norwegianErrorFor('mic_denied')) // CHANGED: Norwegian
    }
  }

  async function playNextAudio() {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return
    isPlayingRef.current = true

    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext()
      }
      const ctx = playbackContextRef.current

      while (audioQueueRef.current.length > 0) {
        const buffer = audioQueueRef.current.shift()!
        const audioBuffer = await ctx.decodeAudioData(buffer.slice(0))
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(ctx.destination)
        await new Promise<void>((resolve) => {
          source.onended = () => resolve()
          source.start()
        })
      }
    } catch (e) {
      console.error('[Hume] audio playback error')
    } finally {
      isPlayingRef.current = false
    }
  }

  function stopSession() {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    wsRef.current?.close()
    playbackContextRef.current?.close()
    playbackContextRef.current = null
    audioQueueRef.current = []
    isPlayingRef.current = false
    setState('idle')
    console.log('[Hume] session stopped')
  }

  // CHANGED: Norwegian state labels
  const stateLabel = {
    idle: 'Trykk for å snakke med Aria',
    connecting: 'Kobler til…',
    listening: 'Aria lytter — trykk for å stoppe',
    processing: 'Aria tenker…',
    error: error ?? 'Aria er utilgjengelig akkurat nå.'
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
      <p style={{
        fontSize: '12px',
        color: state === 'error' ? 'rgba(212,55,55,0.85)' : 'rgba(255,255,255,0.50)',
        letterSpacing: '0.05em',
        textAlign: 'center',
        maxWidth: '280px',
        lineHeight: '1.4'
      }}>
        {stateLabel[state]}
      </p>
    </div>
  )
}
