import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, MessageCircle } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  content_hi?: string;
  content_kn?: string;
  timestamp: Date;
}

interface VoiceQAProps {
  currentLanguage: string;
  cropType?: string;
  translations: Record<string, string>;
}

const VoiceQA: React.FC<VoiceQAProps> = ({
  currentLanguage,
  cropType,
  translations,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    toggleListening,
    clearTranscript,
    isSupported: voiceSupported,
  } = useVoiceInput({
    language: currentLanguage,
    onResult: (text) => {
      setInputText((prev) => prev + text);
    },
  });

  // TTS hook
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get content in current language
  const getContent = (msg: Message): string => {
    switch (currentLanguage) {
      case 'hi':
        return msg.content_hi || msg.content;
      case 'kn':
        return msg.content_kn || msg.content;
      default:
        return msg.content;
    }
  };

  // Handle send message
  const handleSend = async () => {
    const question = inputText.trim();
    if (!question || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    clearTranscript();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('education-qa', {
        body: {
          question,
          cropType,
          language: currentLanguage,
        },
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'Sorry, I could not understand your question.',
        content_hi: data.answer_hi,
        content_kn: data.answer_kn,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Set suggested follow-up questions
      if (data.followUpSuggestions) {
        setSuggestedQuestions(data.followUpSuggestions.slice(0, 3));
      }

      // Auto-speak response
      if (ttsSupported) {
        const responseText = getContent(assistantMessage);
        speak(responseText, currentLanguage);
      }
    } catch (error) {
      console.error('Q&A error:', error);
      toast({
        title: currentLanguage === 'hi' ? 'त्रुटि' : currentLanguage === 'kn' ? 'ದೋಷ' : 'Error',
        description: currentLanguage === 'hi' 
          ? 'प्रश्न का उत्तर देने में विफल। कृपया पुनः प्रयास करें।' 
          : currentLanguage === 'kn'
          ? 'ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Failed to answer question. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle speaking response
  const toggleSpeak = (message: Message) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(getContent(message), currentLanguage);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          🎤 {currentLanguage === 'hi' ? 'प्रश्न पूछें' : currentLanguage === 'kn' ? 'ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ' : 'Ask Questions'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {currentLanguage === 'hi' 
            ? 'खेती के बारे में कुछ भी पूछें - टाइप करें या बोलें!' 
            : currentLanguage === 'kn'
            ? 'ಕೃಷಿ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ - ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ!'
            : 'Ask anything about farming - type or speak!'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-64 overflow-y-auto space-y-3 p-2 bg-muted/30 rounded-lg">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              {currentLanguage === 'hi' 
                ? '👋 नमस्ते! खेती के बारे में कोई प्रश्न पूछें' 
                : currentLanguage === 'kn'
                ? '👋 ನಮಸ್ಕಾರ! ಕೃಷಿ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ'
                : '👋 Hello! Ask any question about farming'}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2 ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  <p className="text-sm">{getContent(msg)}</p>
                  {msg.type === 'assistant' && ttsSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-7 px-2 text-xs"
                      onClick={() => toggleSpeak(msg)}
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-3 w-3 mr-1" />
                      ) : (
                        <Volume2 className="h-3 w-3 mr-1" />
                      )}
                      {currentLanguage === 'hi' ? 'सुनें' : currentLanguage === 'kn' ? 'ಕೇಳಿ' : 'Listen'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-xl px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggestedQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          {voiceSupported && (
            <Button
              variant={isListening ? 'danger' : 'outline'}
              size="icon"
              onClick={toggleListening}
              className={isListening ? 'animate-pulse' : ''}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Input
            value={inputText + interimTranscript}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentLanguage === 'hi'
                ? 'अपना प्रश्न यहाँ लिखें...'
                : currentLanguage === 'kn'
                ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...'
                : 'Type your question here...'
            }
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button
            variant="farmer"
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Voice Status */}
        {isListening && (
          <div className="text-center text-sm text-primary animate-pulse">
            🎤 {currentLanguage === 'hi' ? 'सुन रहा हूँ...' : currentLanguage === 'kn' ? 'ಆಲಿಸುತ್ತಿದೆ...' : 'Listening...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceQA;
