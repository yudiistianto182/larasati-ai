import * as React from "react";
import {
  isSimliConfigured,
  getSimliApiKey,
  SIMLI_FACE_ID,
} from "@/lib/simli-config";

export type SimliConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "fallback"
  | "error";

interface UseSimliAvatarOptions {
  autoConnect?: boolean;
  onConnected?: () => void;
  onFallback?: (reason?: string) => void;
}

export function useSimliAvatar(options: UseSimliAvatarOptions = {}) {
  const { autoConnect = true, onConnected, onFallback } = options;

  const [status, setStatus] = React.useState<SimliConnectionStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = React.useState<boolean>(false);
  const [activeStream, setActiveStream] = React.useState<MediaStream | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simliClientRef = React.useRef<any>(null);
  const isConnectingRef = React.useRef<boolean>(false);
  const isDesiredConnectedRef = React.useRef<boolean>(false);
  const activeClientStartingRef = React.useRef<any>(null);

  // Helper untuk memastikan elemen video/audio selalu tersedia di DOM
  const ensureMediaElements = React.useCallback(() => {
    if (typeof document === "undefined") return { video: null, audio: null };

    let videoEl = videoRef.current;
    if (!videoEl || !document.body.contains(videoEl)) {
      let existingVideo = document.getElementById("simli-hidden-video-anchor") as HTMLVideoElement | null;
      if (!existingVideo) {
        existingVideo = document.createElement("video");
        existingVideo.id = "simli-hidden-video-anchor";
        existingVideo.autoplay = true;
        existingVideo.playsInline = true;
        existingVideo.muted = true;
        existingVideo.style.position = "fixed";
        existingVideo.style.top = "-9999px";
        existingVideo.style.left = "-9999px";
        existingVideo.style.width = "1px";
        existingVideo.style.height = "1px";
        existingVideo.style.opacity = "0";
        existingVideo.style.pointerEvents = "none";
        document.body.appendChild(existingVideo);
      }
      videoEl = existingVideo;
      videoRef.current = videoEl;
    }

    let audioEl = audioRef.current;
    if (!audioEl || !document.body.contains(audioEl)) {
      let existingAudio = document.getElementById("simli-hidden-audio-anchor") as HTMLAudioElement | null;
      if (!existingAudio) {
        existingAudio = document.createElement("audio");
        existingAudio.id = "simli-hidden-audio-anchor";
        existingAudio.autoplay = true;
        existingAudio.muted = false;
        existingAudio.volume = 1.0;
        existingAudio.style.display = "none";
        document.body.appendChild(existingAudio);
      } else {
        existingAudio.muted = false;
        existingAudio.volume = 1.0;
      }
      audioEl = existingAudio;
      audioRef.current = audioEl;
    } else {
      audioEl.muted = false;
      audioEl.volume = 1.0;
    }

    return { video: videoEl, audio: audioEl };
  }, []);

  const disconnect = React.useCallback(() => {
    isDesiredConnectedRef.current = false;

    // 1. Jika ada client yang sedang dalam proses start/handshake, hentikan segera
    if (activeClientStartingRef.current) {
      const startingClient = activeClientStartingRef.current;
      activeClientStartingRef.current = null;
      try {
        if (typeof startingClient.stop === "function") {
          startingClient.stop().catch(() => {});
        } else if (typeof startingClient.close === "function") {
          startingClient.close();
        }
      } catch {
        // Safe ignore
      }
    }

    // 2. Jika ada client aktif, bersihkan buffer dan tutup sesi
    if (simliClientRef.current) {
      const client = simliClientRef.current;
      simliClientRef.current = null;
      try {
        if (typeof client.ClearBuffer === "function") {
          client.ClearBuffer();
        }
      } catch {
        // Safe ignore
      }
      try {
        if (typeof client.stop === "function") {
          client.stop().catch(() => {});
        } else if (typeof client.close === "function") {
          client.close();
        }
      } catch {
        // Safe ignore
      }
    }

    // 3. Hentikan media stream aktif pada elemen video & audio
    const videoEl = videoRef.current;
    if (videoEl && videoEl.srcObject instanceof MediaStream) {
      videoEl.srcObject.getTracks().forEach((t) => t.stop());
      videoEl.srcObject = null;
    }

    const hiddenVideo = typeof document !== "undefined" ? (document.getElementById("simli-hidden-video-anchor") as HTMLVideoElement | null) : null;
    if (hiddenVideo && hiddenVideo.srcObject instanceof MediaStream) {
      hiddenVideo.srcObject.getTracks().forEach((t) => t.stop());
      hiddenVideo.srcObject = null;
    }

    isConnectingRef.current = false;
    setIsAvatarSpeaking(false);
    setActiveStream(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const connect = React.useCallback(
    async (force = false) => {
      if (typeof window === "undefined") return false;
      if (isConnectingRef.current) return false;
      if (simliClientRef.current && !force && status === "connected") return true;

      isDesiredConnectedRef.current = true;

      // Bersihkan sesi lama jika ada
      if (simliClientRef.current || activeClientStartingRef.current) {
        disconnect();
      }

      isDesiredConnectedRef.current = true;

      // 1. Cek konfigurasi API Key & Face ID
      if (!isSimliConfigured()) {
        console.log(
          "%c[Simli Avatar] 🟠 SIMLI_API_KEY / SIMLI_FACE_ID belum diatur. Menggunakan avatar foto (Fallback Mode).",
          "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        );
        setStatus("fallback");
        onFallback?.("Kunci API atau Avatar ID belum diisi.");
        return false;
      }

      try {
        isConnectingRef.current = true;
        setStatus("connecting");
        setErrorMessage(null);

        // 2. Pastikan elemen video/audio tersedia di DOM
        const { video, audio } = ensureMediaElements();
        if (!video || !audio) {
          throw new Error("Elemen video/audio belum siap di DOM.");
        }

        // 3. Dynamic Import simli-client
        const simliModule = await import("simli-client/dist/client.js" as string);
        const SimliClient = simliModule.SimliClient || simliModule.default?.SimliClient || simliModule.default;
        const generateSimliSessionToken =
          simliModule.generateSimliSessionToken || simliModule.default?.generateSimliSessionToken;

        if (!SimliClient || !generateSimliSessionToken) {
          throw new Error("Gagal memuat modul SimliClient.");
        }

        // Cek jika pengguna sudah berpindah stase saat dynamic import
        if (!isDesiredConnectedRef.current) {
          isConnectingRef.current = false;
          setStatus("idle");
          return false;
        }

        console.log("[Simli Avatar] 🟡 Meminta session token ke Simli API...", {
          faceId: SIMLI_FACE_ID.trim(),
        });

        const sessionResponse = await generateSimliSessionToken({
          apiKey: getSimliApiKey(),
          config: {
            faceId: SIMLI_FACE_ID.trim(),
            handleSilence: true,
            maxSessionLength: 600,
            maxIdleTime: 300,
          },
        });

        // Cek lagi jika pengguna sudah berpindah stase saat request token
        if (!isDesiredConnectedRef.current) {
          isConnectingRef.current = false;
          setStatus("idle");
          return false;
        }

        const sessionToken = sessionResponse?.session_token;
        if (!sessionToken) {
          throw new Error("Gagal memperoleh session token dari server Simli.");
        }

        console.log("[Simli Avatar] 🟢 Session token diperoleh. Memulai koneksi WebRTC...");

        const client = new SimliClient(
          sessionToken,
          video,
          audio,
          null,
          0, // LogLevel
          "livekit",
          "websockets",
          "wss://api.simli.ai",
          1500, // Low-latency buffer size
        );

        activeClientStartingRef.current = client;

        client.on("start", () => {
          if (!isDesiredConnectedRef.current) {
            try {
              client.stop().catch(() => {});
            } catch {
              // ignore
            }
            return;
          }

          console.log(
            "%c[Simli Avatar] 🟢 BERHASIL TERHUBUNG: Virtual Live Avatar Aktif",
            "background: #047857; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
          );
          if (video.srcObject instanceof MediaStream) {
            setActiveStream(video.srcObject);
          }
          setStatus("connected");
          onConnected?.();
        });

        client.on("speaking", () => {
          if (isDesiredConnectedRef.current) {
            setIsAvatarSpeaking(true);
          }
        });

        client.on("silent", () => {
          setIsAvatarSpeaking(false);
        });

        client.on("error", (errorMsg: unknown) => {
          if (!isDesiredConnectedRef.current) return;
          console.warn("[Simli Avatar] ⚠️ WebRTC Error event:", errorMsg);
          setStatus("fallback");
          onFallback?.(String(errorMsg));
        });

        client.on("startup_error", (errorMsg: unknown) => {
          if (!isDesiredConnectedRef.current) return;
          console.warn("[Simli Avatar] ⚠️ Startup error (fallback ke foto):", errorMsg);
          setStatus("fallback");
          setErrorMessage(String(errorMsg));
          onFallback?.(String(errorMsg));
        });

        client.on("stop", () => {
          console.log("[Simli Avatar] Sesi koneksi Simli dihentikan.");
          if (isDesiredConnectedRef.current) {
            setStatus("fallback");
          } else {
            setStatus("idle");
          }
        });

        await client.start();

        // Cek jika disconnect dipanggil saat await client.start()
        if (!isDesiredConnectedRef.current) {
          try {
            client.stop().catch(() => {});
          } catch {
            // ignore
          }
          activeClientStartingRef.current = null;
          isConnectingRef.current = false;
          setStatus("idle");
          return false;
        }

        activeClientStartingRef.current = null;
        simliClientRef.current = client;
        isConnectingRef.current = false;
        return true;
      } catch (err: unknown) {
        activeClientStartingRef.current = null;
        isConnectingRef.current = false;
        if (!isDesiredConnectedRef.current) {
          setStatus("idle");
          return false;
        }
        const msg = err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err);
        console.warn(
          "%c[Simli Avatar] ⚠️ Gagal menghubung ke Simli (Fallback Mode): " + msg,
          "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        );
        setStatus("fallback");
        setErrorMessage(msg);
        onFallback?.(msg);
        return false;
      }
    },
    [disconnect, ensureMediaElements, onConnected, onFallback, status],
  );

  // Mengirim audio PCM16 langsung ke Simli WebRTC
  const sendAudioData = React.useCallback((pcm16Data: Uint8Array) => {
    if (simliClientRef.current && typeof simliClientRef.current.sendAudioData === "function") {
      try {
        simliClientRef.current.sendAudioData(pcm16Data);
      } catch (err) {
        console.warn("[Simli Avatar] Error saat mengirim data audio:", err);
      }
    }
  }, []);

  // Membersihkan audio buffer di Simli (menghentikan gerakan mulut segera)
  const clearBuffer = React.useCallback(() => {
    if (simliClientRef.current && typeof simliClientRef.current.ClearBuffer === "function") {
      try {
        simliClientRef.current.ClearBuffer();
      } catch (err) {
        console.warn("[Simli Avatar] Error saat membersihkan buffer:", err);
      }
    }
    setIsAvatarSpeaking(false);
  }, []);

  // Stable connect/disconnect lifecycle: hanya jalankan sekali saat mount dan cleanup saat unmount
  const connectRef = React.useRef(connect);
  connectRef.current = connect;
  const disconnectRef = React.useRef(disconnect);
  disconnectRef.current = disconnect;

  React.useEffect(() => {
    if (autoConnect) {
      connectRef.current();
    }
    return () => {
      disconnectRef.current();
    };
  }, [autoConnect]);

  return {
    status,
    errorMessage,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isReady: status === "connected" || status === "fallback",
    isAvatarSpeaking,
    activeStream,
    videoRef,
    audioRef,
    connect,
    disconnect,
    sendAudioData,
    clearBuffer,
  };
}

export type SimliAvatarHandle = ReturnType<typeof useSimliAvatar>;

