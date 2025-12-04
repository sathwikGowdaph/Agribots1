import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const {
    language = 'en-IN',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
    }
  }, [continuous, interimResults]);

  // Get language code for speech recognition
  const getLanguageCode = useCallback((lang: string): string => {
    const languageMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
    };
    return languageMap[lang] || lang;
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech recognition not supported';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    try {
      recognitionRef.current.lang = getLanguageCode(language);

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          onResult?.(finalTranscript);
        }
        setInterimTranscript(currentInterim);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMsg = 'Voice recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMsg = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMsg = 'Microphone not found. Please check your device.';
            break;
          case 'not-allowed':
            errorMsg = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMsg = 'Network error. Please check your connection.';
            break;
          default:
            errorMsg = `Error: ${event.error}`;
        }

        setError(errorMsg);
        onError?.(errorMsg);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (err) {
      const errorMsg = 'Failed to start voice recognition';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsListening(false);
    }
  }, [language, getLanguageCode, onResult, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}

// Web Speech API types handled via 'any' for cross-browser compatibility
