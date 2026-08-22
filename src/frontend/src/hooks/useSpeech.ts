import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechReturn {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  speechError: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  resetTranscript: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Web Speech API has no official TS types
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      // biome-ignore lint/suspicious/noExplicitAny: vendor-prefixed global
      (window as any).SpeechRecognition ||
      // biome-ignore lint/suspicious/noExplicitAny: vendor-prefixed global
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };
    rec.onend = () => setIsListening(false);
    // biome-ignore lint/suspicious/noExplicitAny: Web Speech API event type
    rec.onerror = (event: any) => {
      setIsListening(false);
      if (event?.error === "not-allowed" || event?.error === "denied") {
        setSpeechError("Mic permission nahi mili. Browser settings mein allow karein.");
      } else if (event?.error === "no-speech") {
        setSpeechError(null); // not a real error, just silence — ignore
      } else if (event?.error && event.error !== "aborted") {
        setSpeechError("Voice input abhi available nahi hai. Type karke try karein.");
      }
    };
    // biome-ignore lint/suspicious/noExplicitAny: Web Speech API event type
    rec.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) setTranscript(final);
    };
    recognitionRef.current = rec;
  }, []);

  const startListening = useCallback(() => {
    setTranscript("");
    setSpeechError(null);
    try {
      recognitionRef.current?.start();
    } catch {
      /* already started */
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || !text) return;
    try {
      // On some Android devices, calling speak() when no TTS voice pack is
      // installed triggers a system "voice data missing" prompt. Checking
      // for available voices first avoids firing that prompt — if there
      // are none, we just skip audio and let the text-only answer stand.
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setSpeechError(null);
  }, []);

  return {
    isSupported,
    isListening,
    isSpeaking,
    transcript,
    speechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  };
}
