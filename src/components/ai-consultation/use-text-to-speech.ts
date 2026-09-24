import * as React from "react";
import { getEffectiveGeminiApiKey } from "@/lib/gemini-ai";
import { useSysConfigStore } from "@/stores/sys-config-store";

export interface UseTextToSpeechOptions {
  onSendPcmAudio?: (data: Uint8Array) => void;
  onClearBuffer?: () => void;
  isSimliActive?: boolean;
}

/**
 * Sintesis suara menggunakan Google Cloud Text-to-Speech API (LINEAR16, 16kHz).
 * Menghasilkan raw 16-bit 16kHz PCM audio yang siap diteruskan ke Simli Avatar.
 */
async function synthesizeGoogleTts(
  text: string,
  apiKey: string,
): Promise<{ pcmData: Uint8Array; wavBlob: Blob } | null> {
  if (!apiKey?.trim()) return null;

  try {
    console.log("[Google TTS] 🎙️ Mengirim teks ke Google Cloud Text-to-Speech API (LINEAR16, 16000Hz, id-ID)...");
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey.trim()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "id-ID",
            name: "id-ID-Standard-A", // Suara wanita Bahasa Indonesia Google TTS
            ssmlGender: "FEMALE",
          },
          audioConfig: {
            audioEncoding: "LINEAR16",
            sampleRateHertz: 16000,
            speakingRate: 1.0,
            pitch: 0.0,
          },
        }),
      },
    );

    if (!res.ok) {
      console.warn("[Google Cloud TTS] Gagal status:", res.status);
      return null;
    }

    const data = await res.json();
    if (!data.audioContent) return null;

    // Decode base64 WAV ke byte array
    const binaryStr = atob(data.audioContent);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const wavBlob = new Blob([bytes], { type: "audio/wav" });

    // Cari marker chunk 'data' pada WAV header
    let pcmOffset = 44;
    for (let i = 12; i < Math.min(bytes.length - 8, 200); i++) {
      if (
        bytes[i] === 0x64 &&
        bytes[i + 1] === 0x61 &&
        bytes[i + 2] === 0x74 &&
        bytes[i + 3] === 0x61
      ) {
        pcmOffset = i + 8;
        break;
      }
    }

    const pcmData = bytes.subarray(pcmOffset);
    console.log("[Google TTS] ✅ Berhasil mendapatkan audio PCM dari Google TTS:", {
      totalBytes: bytes.length,
      pcmBytes: pcmData.length,
    });

    return { pcmData, wavBlob };
  } catch (err) {
    console.warn("[Google Cloud TTS] Network error:", err);
    return null;
  }
}

/**
 * Fallback generator frame PCM formant suara manusia (16kHz 16-bit mono).
 * Digunakan jika Google Cloud API tidak merespons, agar avatar Simli tetap bergerak saat Browser TTS bersuara.
 */
function createSpeechPcmFrame(sampleRate = 16000, durationMs = 100, phaseRef = { phase: 0 }): Uint8Array {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(numSamples * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < numSamples; i++) {
    phaseRef.phase += 1;
    const t = phaseRef.phase / sampleRate;
    const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 4 * t);
    const s1 = Math.sin(2 * Math.PI * 220 * t);
    const s2 = 0.6 * Math.sin(2 * Math.PI * 440 * t);
    const s3 = 0.3 * Math.sin(2 * Math.PI * 880 * t);
    const s4 = 0.15 * Math.sin(2 * Math.PI * 1760 * t);
    const sampleVal = (s1 + s2 + s3 + s4) * mod * 0.25;

    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sampleVal * 32767)));
    view.setInt16(i * 2, int16, true);
  }

  return new Uint8Array(buffer);
}

export function useTextToSpeech(options?: UseTextToSpeechOptions) {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(true);

  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const activeAudioElRef = React.useRef<HTMLAudioElement | null>(null);
  const animationIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const isCancelledRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  const stopSimliAnimation = React.useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    optionsRef.current?.onClearBuffer?.();
  }, []);

  const cancel = React.useCallback(() => {
    isCancelledRef.current = true;
    stopSimliAnimation();

    if (activeAudioElRef.current) {
      activeAudioElRef.current.pause();
      activeAudioElRef.current.src = "";
      activeAudioElRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  }, [stopSimliAnimation]);

  const speak = React.useCallback(
    async (text: string) => {
      if (!text?.trim()) return;

      cancel();
      isCancelledRef.current = false;
      setIsSpeaking(true);

      const opts = optionsRef.current;
      const googleApiKey = getEffectiveGeminiApiKey() || useSysConfigStore.getState().geminiApiKey;

      // 1. UTAMA: Gunakan Google Cloud Text-to-Speech API
      if (googleApiKey) {
        const googleRes = await synthesizeGoogleTts(text, googleApiKey);

        if (googleRes && !isCancelledRef.current) {
          const { pcmData, wavBlob } = googleRes;

          // Putar audio suara Google TTS di browser
          const audioUrl = URL.createObjectURL(wavBlob);
          const audio = new Audio(audioUrl);
          activeAudioElRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            opts?.onClearBuffer?.();
            setIsSpeaking(false);
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            opts?.onClearBuffer?.();
            setIsSpeaking(false);
          };

          await audio.play().catch((playErr) => {
            console.warn("[Google TTS] Audio play error:", playErr);
          });

          // Kirim chunk audio PCM 16kHz ke Simli WebRTC secara realtime (~100ms per chunk)
          if (opts?.isSimliActive && opts?.onSendPcmAudio) {
            const CHUNK_SIZE = 3200; // 3200 byte = 1600 sample = 100ms audio 16kHz 16-bit
            for (let i = 0; i < pcmData.length; i += CHUNK_SIZE) {
              if (isCancelledRef.current) break;
              const chunk = pcmData.slice(i, i + CHUNK_SIZE);
              opts.onSendPcmAudio(chunk);
              await new Promise((r) => setTimeout(r, 96));
            }
          }

          return;
        }
      }

      // 2. FALLBACK: Web Speech API dengan Google Bahasa Indonesia Voice
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const googleVoice =
        voices.find((v) => v.name.toLowerCase().includes("google") && v.lang.startsWith("id")) ||
        voices.find((v) => v.lang.startsWith("id")) ||
        voices.find((v) => v.lang.toLowerCase().includes("id"));

      if (googleVoice) {
        utterance.voice = googleVoice;
      }

      const phaseTracker = { phase: 0 };

      utterance.onstart = () => {
        if (isCancelledRef.current) return;
        setIsSpeaking(true);

        if (opts?.isSimliActive && opts?.onSendPcmAudio) {
          stopSimliAnimation();
          animationIntervalRef.current = setInterval(() => {
            if (isCancelledRef.current) {
              stopSimliAnimation();
              return;
            }
            const pcmFrame = createSpeechPcmFrame(16000, 100, phaseTracker);
            opts.onSendPcmAudio?.(pcmFrame);
          }, 100);
        }
      };

      utterance.onend = () => {
        stopSimliAnimation();
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        stopSimliAnimation();
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [cancel, stopSimliAnimation],
  );

  React.useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    isSpeaking,
    isSupported,
    speak,
    cancel,
    stop: cancel,
  };
}
