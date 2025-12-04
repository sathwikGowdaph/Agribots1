import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { rate = 0.9, pitch = 1, volume = 1 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support and load voices
  useEffect(() => {
    setIsSupported('speechSynthesis' in window);

    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Get best voice for language
  const getVoiceForLanguage = useCallback(
    (language: string): SpeechSynthesisVoice | null => {
      const langCodes: Record<string, string[]> = {
        en: ['en-IN', 'en-US', 'en-GB', 'en'],
        hi: ['hi-IN', 'hi'],
        kn: ['kn-IN', 'kn'],
      };

      const codes = langCodes[language] || [language];

      for (const code of codes) {
        const voice = availableVoices.find(
          (v) => v.lang.toLowerCase().startsWith(code.toLowerCase())
        );
        if (voice) return voice;
      }

      // Fallback to any available voice
      return availableVoices[0] || null;
    },
    [availableVoices]
  );

  // Speak text
  const speak = useCallback(
    (text: string, language: string = 'en') => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set voice
      const voice = getVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Fallback language codes
        const langMap: Record<string, string> = {
          en: 'en-IN',
          hi: 'hi-IN',
          kn: 'kn-IN',
        };
        utterance.lang = langMap[language] || 'en-IN';
      }

      // Set properties
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        console.log('TTS started:', language);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        console.log('TTS ended');
      };

      utterance.onerror = (event) => {
        console.error('TTS error:', event.error);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, getVoiceForLanguage, rate, pitch, volume]
  );

  // Stop speaking
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  // Resume speaking
  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  return {
    speak,
    stop,
    pause,
    resume,
    togglePause,
    isSpeaking,
    isPaused,
    isSupported,
    availableVoices,
  };
}
