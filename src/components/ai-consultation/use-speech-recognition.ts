import * as React from "react";

interface UseSpeechRecognitionOptions {
  onFinalTranscript?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  lang?: string;
  silenceTimeoutMs?: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onFinalTranscript, onFinalResult, lang = "id-ID", silenceTimeoutMs = 1400 } = options;
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [interimTranscript, setInterimTranscript] = React.useState("");
  const [isSupported, setIsSupported] = React.useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = React.useRef<any>(null);
  const silenceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const latestSpeechRef = React.useRef<string>("");

  const notifyFinalRef = React.useRef<(t: string) => void>(() => {});
  notifyFinalRef.current = (t: string) => {
    onFinalTranscript?.(t);
    onFinalResult?.(t);
  };

  const finalizeSpeech = React.useCallback((textToFinalize?: string) => {
    const text = (textToFinalize || latestSpeechRef.current || "").trim();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    setIsListening(false);
    setInterimTranscript("");

    if (text) {
      setTranscript(text);
      notifyFinalRef.current(text);
      latestSpeechRef.current = "";
    }
  }, []);

  React.useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("");
      latestSpeechRef.current = "";
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentInterim = "";
      let currentFinal = "";

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      const activeText = (currentFinal || currentInterim).trim();
      if (activeText) {
        latestSpeechRef.current = activeText;
        setInterimTranscript(activeText);

        // Reset silence timer on every new speech chunk detected
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // When user pauses speaking for silenceTimeoutMs, auto-finalize the speech!
        silenceTimerRef.current = setTimeout(() => {
          finalizeSpeech(activeText);
        }, silenceTimeoutMs);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      if (latestSpeechRef.current.trim()) {
        finalizeSpeech(latestSpeechRef.current);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, silenceTimeoutMs, finalizeSpeech]);

  const startListening = React.useCallback(() => {
    if (recognitionRef.current) {
      try {
        setTranscript("");
        setInterimTranscript("");
        latestSpeechRef.current = "";
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 100);
        } catch {
          // ignore
        }
      }
      setIsListening(true);
    }
  }, []);

  const stopListening = React.useCallback(() => {
    finalizeSpeech();
  }, [finalizeSpeech]);

  const resetTranscript = React.useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    latestSpeechRef.current = "";
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
