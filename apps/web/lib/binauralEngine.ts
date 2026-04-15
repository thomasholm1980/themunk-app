'use client'
// Binaural Audio Engine
// Uses Web Audio API for bit-accurate sine wave generation
// Carrier: 200 Hz | Delta per mode added to right channel

let audioCtx: AudioContext | null = null
let leftOsc: OscillatorNode | null = null
let rightOsc: OscillatorNode | null = null
let gainNode: GainNode | null = null

const CARRIER_HZ = 200

export function startBinaural(targetHz: number, volume = 0.15) {
  stopBinaural()

  audioCtx = new AudioContext()
  const merger = audioCtx.createChannelMerger(2)
  gainNode = audioCtx.createGain()
  gainNode.gain.value = volume

  // Left channel — carrier
  leftOsc = audioCtx.createOscillator()
  leftOsc.frequency.value = CARRIER_HZ
  leftOsc.type = 'sine'

  // Right channel — carrier + binaural offset
  rightOsc = audioCtx.createOscillator()
  rightOsc.frequency.value = CARRIER_HZ + targetHz
  rightOsc.type = 'sine'

  const leftGain = audioCtx.createGain()
  const rightGain = audioCtx.createGain()
  leftGain.gain.value = 1
  rightGain.gain.value = 1

  leftOsc.connect(leftGain)
  rightOsc.connect(rightGain)
  leftGain.connect(merger, 0, 0)
  rightGain.connect(merger, 0, 1)
  merger.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  leftOsc.start()
  rightOsc.start()
}

export function stopBinaural() {
  try {
    leftOsc?.stop()
    rightOsc?.stop()
    audioCtx?.close()
  } catch {}
  audioCtx = null
  leftOsc = null
  rightOsc = null
  gainNode = null
}

export function setBinauralVolume(v: number) {
  if (gainNode) gainNode.gain.value = Math.max(0, Math.min(1, v))
}
