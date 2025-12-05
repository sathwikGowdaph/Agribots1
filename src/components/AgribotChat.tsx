import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  content_hi?: string;
  content_kn?: string;
}

interface AgribotChatProps {
  currentLanguage: string;
  translations: {
    chatbot: {
      title: string;
      subtitle: string;
      welcomeMessage: string;
      placeholder: string;
      disclaimer: string;
    };
  };
}

const AgribotChat: React.FC<AgribotChatProps> = ({ currentLanguage, translations }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  const chatbotText = translations.chatbot;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('agribot-chat', {
        body: {
          message: input.trim(),
          language: currentLanguage,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response?.en || data?.response || 'I apologize, I could not process your request.',
        content_hi: data?.response?.hi,
        content_kn: data?.response?.kn,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: currentLanguage === 'hi' ? 'त्रुटि' : currentLanguage === 'kn' ? 'ದೋಷ' : 'Error',
        description: currentLanguage === 'hi'
          ? 'संदेश भेजने में विफल'
          : currentLanguage === 'kn'
          ? 'ಸಂದೇಶ ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ'
          : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeak = (msg: Message) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(getContent(msg), currentLanguage);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          🤖 {chatbotText.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{chatbotText.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-72 overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center p-4">
              {chatbotText.welcomeMessage}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === 'assistant' && <Bot className="h-4 w-4 mt-0.5 shrink-0" />}
                    <p className="text-sm whitespace-pre-wrap">{getContent(msg)}</p>
                    {msg.role === 'user' && <User className="h-4 w-4 mt-0.5 shrink-0" />}
                  </div>
                  {msg.role === 'assistant' && ttsSupported && (
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

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={chatbotText.placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="farmer"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ {chatbotText.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
};

export default AgribotChat;
