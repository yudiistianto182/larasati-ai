import * as React from "react";
import { convertTextToSimliPcm16 } from "@/lib/tts-audio-processor";

interface UseTextToSpeechOptions {
  onSendPcmAudio?: (pcm16Chunk: Uint8Array) => void;
  onClearBuffer?: () => void;
  isSimliActive?: boolean;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { onSendPcmAudio, onClearBuffer, isSimliActive = false } = options;

  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(true);

  const speechEndTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
    }
  }, []);

  const cancel = React.useCallback(() => {
    isCancelledRef.current = true;
    if (speechEndTimeoutRef.current) {
      clearTimeout(speechEndTimeoutRef.current);
      speechEndTimeoutRef.current = null;
    }
    if (onClearBuffer && isSimliActive) {
      onClearBuffer();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [onClearBuffer, isSimliActive]);

  const speak = React.useCallback(
    async (text: string) => {
      if (typeof window === "undefined" || !text?.trim()) {
        return;
      }

      cancel();
      isCancelledRef.current = false;
      setIsSpeaking(true);

      // 1. JIKA SIMLI LIVE WEBRTC AKTIF: Alirkan audio vokal asli Bahasa Indonesia langsung ke Simli (Simli 100% generate suara & bibir)
      if (isSimliActive && onSendPcmAudio) {
        try {
          const pcm16Audio = await convertTextToSimliPcm16(text);

          if (isCancelledRef.current) return;

          if (pcm16Audio && pcm16Audio.length > 0) {
            // Hitung durasi total audio asli (16.000 sampel/detik * 2 byte/sampel = 32.000 byte/detik)
            const totalDurationMs = (pcm16Audio.length / (16000 * 2)) * 1000;

            // Alirkan audio ke Simli dalam chunk 6000 byte
            const chunkSize = 6000;
            for (let offset = 0; offset < pcm16Audio.length; offset += chunkSize) {
              if (isCancelledRef.current) break;
              const chunk = pcm16Audio.subarray(offset, Math.min(pcm16Audio.length, offset + chunkSize));
              onSendPcmAudio(chunk);
            }

            // Selesai bicara saat durasi audio asli habis
            speechEndTimeoutRef.current = setTimeout(() => {
              if (!isCancelledRef.current) {
                setIsSpeaking(false);
                onClearBuffer?.();
              }
            }, totalDurationMs + 200);

            return;
          }
        } catch (err) {
          console.warn("[Simli TTS] Gagal mengirim audio asli ke Simli:", err);
        }
      }

      // 2. FALLBACK: Hanya dipakai jika Simli TIDAK aktif (misal foto fallback tanpa WebRTC)
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        const voices = window.speechSynthesis.getVoices();
        const indonesianVoice = voices.find((v) => v.lang === "id-ID" || v.lang.startsWith("id"));
        if (indonesianVoice) {
          utterance.voice = indonesianVoice;
        }

        utterance.onstart = () => {
          if (!isCancelledRef.current) {
            setIsSpeaking(true);
          }
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          onClearBuffer?.();
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          onClearBuffer?.();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    },
    [cancel, isSimliActive, onSendPcmAudio, onClearBuffer],
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
