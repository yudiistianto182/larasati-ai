import * as React from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  const speak = React.useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // slightly gentle/warm female voice pitch

    // Find Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang === "id-ID" || v.lang.startsWith("id"),
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    cancel,
  };
}
