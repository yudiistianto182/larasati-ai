function splitTextIntoChunks(text: string, maxLen = 130): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  const sentences = clean.split(/(?<=[.?!,;:])\s+/);
  let cur = "";

  for (const s of sentences) {
    if ((cur + " " + s).trim().length <= maxLen) {
      cur = (cur + " " + s).trim();
    } else {
      if (cur) chunks.push(cur);
      if (s.length > maxLen) {
        const words = s.split(/\s+/);
        let wCur = "";
        for (const w of words) {
          if ((wCur + " " + w).trim().length <= maxLen) {
            wCur = (wCur + " " + w).trim();
          } else {
            if (wCur) chunks.push(wCur);
            wCur = w;
          }
        }
        cur = wCur;
      } else {
        cur = s;
      }
    }
  }
  if (cur) chunks.push(cur);
  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

function concatArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result.buffer;
}

/**
 * Mengambil audio vokal manusia asli melalui endpoint /api/tts
 * lalu mendecode dan meresample ke PCM 16-bit 16.000 Hz Mono untuk Simli.
 */
export async function convertTextToSimliPcm16(text: string): Promise<Uint8Array | null> {
  if (typeof window === "undefined" || !text?.trim()) {
    return null;
  }

  try {
    const cleanText = text.replace(/[*_#`~>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);

    // 1. Ambil audio vokal asli Bahasa Indonesia dari endpoint /api/tts
    let response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText }),
    }).catch(() => null);

    if (!response || !response.ok) {
      // Fallback ke GET jika POST bermasalah
      response = await fetch(`/api/tts?text=${encodeURIComponent(cleanText)}`).catch(() => null);
    }

    let mp3ArrayBuffer: ArrayBuffer | null = null;
    if (response && response.ok) {
      mp3ArrayBuffer = await response.arrayBuffer();
    }

    // 2. Direct client fallback jika server offline
    if (!mp3ArrayBuffer || mp3ArrayBuffer.byteLength === 0) {
      const chunks = splitTextIntoChunks(cleanText, 130);
      const buffers: ArrayBuffer[] = [];

      for (const chunk of chunks) {
        const enc = encodeURIComponent(chunk);
        const directUrls = [
          `https://translate.google.com/translate_tts?ie=UTF-8&q=${enc}&tl=id&client=tw-ob`,
          `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${enc}&tl=id&client=gtx`,
        ];

        for (const url of directUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const buf = await res.arrayBuffer();
              if (buf && buf.byteLength > 100) {
                buffers.push(buf);
                break;
              }
            }
          } catch {
            // Next direct url
          }
        }
      }

      if (buffers.length > 0) {
        mp3ArrayBuffer = concatArrayBuffers(buffers);
      }
    }

    if (!mp3ArrayBuffer || mp3ArrayBuffer.byteLength === 0) {
      console.warn("[TTS API] Audio upstream tidak tersedia. Beralih ke fallback speech.");
      return null;
    }

    // 3. Decode MP3 menggunakan Web Audio API peramban
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const decodedBuffer = await audioCtx.decodeAudioData(mp3ArrayBuffer);

    // 4. Resample ke 16.000 Hz Mono (format input resmi Simli WebRTC)
    const targetSampleRate = 16000;
    const targetLength = Math.ceil(decodedBuffer.duration * targetSampleRate);
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    await audioCtx.close();

    // 5. Konversi float32 samples [-1.0, 1.0] ke Int16 Little Endian (PCM16)
    const channelData = resampledBuffer.getChannelData(0);
    const pcm16Buffer = new ArrayBuffer(channelData.length * 2);
    const dataView = new DataView(pcm16Buffer);

    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
      dataView.setInt16(i * 2, int16, true);
    }

    return new Uint8Array(pcm16Buffer);
  } catch (error) {
    console.warn("[TTS Audio Processor] Gagal mengonversi suara:", error);
    return null;
  }
}
