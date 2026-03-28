let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

const cache: Record<string, AudioBuffer> = {}

async function loadBuffer(src: string): Promise<AudioBuffer> {
  if (cache[src]) return cache[src]
  const res = await fetch(src)
  const arrayBuf = await res.arrayBuffer()
  const decoded = await getCtx().decodeAudioData(arrayBuf)
  cache[src] = decoded
  return decoded
}

async function play(src: string, volume = 1) {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') await ctx.resume()
    const buf = await loadBuffer(src)
    const source = ctx.createBufferSource()
    source.buffer = buf
    const gain = ctx.createGain()
    gain.gain.value = volume
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  } catch {
    // Audio unavailable — silent fail
  }
}

export const audio = {
  success: () => play('/sounds/success.wav', 0.7),
  desync: () => play('/sounds/desync-warn.wav', 0.6),
}
