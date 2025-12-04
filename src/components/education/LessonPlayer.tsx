import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface Slide {
  title?: string;
  text: string;
  text_hi?: string;
  text_kn?: string;
  emoji?: string;
  duration: number;
}

interface LessonPlayerProps {
  lesson: {
    id: string;
    title: string;
    title_hi?: string;
    title_kn?: string;
    content: string;
    content_hi?: string;
    content_kn?: string;
    slides?: Slide[];
    keyPoints?: string[];
    keyPoints_hi?: string[];
    keyPoints_kn?: string[];
    practicalTip?: string;
    practicalTip_hi?: string;
    practicalTip_kn?: string;
  };
  currentLanguage: string;
  onClose: () => void;
  onComplete?: () => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  currentLanguage,
  onClose,
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Get content in current language
  const getContent = (
    en?: string,
    hi?: string,
    kn?: string
  ): string => {
    switch (currentLanguage) {
      case 'hi':
        return hi || en || '';
      case 'kn':
        return kn || en || '';
      default:
        return en || '';
    }
  };

  // Build slides from lesson content
  const slides: Slide[] = lesson.slides?.length
    ? lesson.slides
    : [
        {
          title: getContent(lesson.title, lesson.title_hi, lesson.title_kn),
          text: getContent(lesson.content, lesson.content_hi, lesson.content_kn),
          emoji: '📚',
          duration: 15,
        },
      ];

  const totalSlides = slides.length;

  // Get current slide text
  const getCurrentSlideText = useCallback(() => {
    const slide = slides[currentSlide];
    return getContent(slide.text, slide.text_hi, slide.text_kn);
  }, [currentSlide, slides, currentLanguage]);

  // Speak current slide
  const speakCurrentSlide = useCallback(() => {
    if (ttsSupported) {
      const text = getCurrentSlideText();
      speak(text, currentLanguage);
    }
  }, [ttsSupported, getCurrentSlideText, currentLanguage, speak]);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || !autoPlayEnabled) return;

    const slide = slides[currentSlide];
    const duration = (slide.duration || 8) * 1000;

    const timer = setTimeout(() => {
      if (currentSlide < totalSlides - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        onComplete?.();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSlide, totalSlides, autoPlayEnabled, slides, onComplete]);

  // Update progress
  useEffect(() => {
    setProgress(((currentSlide + 1) / totalSlides) * 100);
  }, [currentSlide, totalSlides]);

  // Speak when slide changes during playback
  useEffect(() => {
    if (isPlaying && autoPlayEnabled) {
      speakCurrentSlide();
    }
  }, [currentSlide, isPlaying, autoPlayEnabled]);

  // Navigate slides
  const goToSlide = (index: number) => {
    stop();
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakCurrentSlide();
    }
  };

  // Toggle voice
  const toggleVoice = () => {
    if (isSpeaking) {
      stop();
    } else {
      speakCurrentSlide();
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            📚 {getContent(lesson.title, lesson.title_hi, lesson.title_kn)}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
        <div className="text-xs text-muted-foreground text-right mt-1">
          {currentSlide + 1} / {totalSlides}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Slide Content */}
        <div className="min-h-[200px] bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          {currentSlideData.emoji && (
            <span className="text-5xl mb-4">{currentSlideData.emoji}</span>
          )}
          {currentSlideData.title && (
            <h3 className="text-xl font-bold mb-3">{currentSlideData.title}</h3>
          )}
          <p className="text-lg leading-relaxed">
            {getContent(
              currentSlideData.text,
              currentSlideData.text_hi,
              currentSlideData.text_kn
            )}
          </p>
        </div>

        {/* Key Points (if on last slide) */}
        {currentSlide === totalSlides - 1 && lesson.keyPoints && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              ✨ {currentLanguage === 'hi' ? 'मुख्य बिंदु' : currentLanguage === 'kn' ? 'ಪ್ರಮುಖ ಅಂಶಗಳು' : 'Key Points'}
            </h4>
            <ul className="space-y-1 text-sm">
              {(currentLanguage === 'hi' ? lesson.keyPoints_hi : currentLanguage === 'kn' ? lesson.keyPoints_kn : lesson.keyPoints)?.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="farmer"
            size="lg"
            onClick={togglePlay}
            className="rounded-full w-14 h-14"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Voice Control */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVoice}
            className="gap-2"
            disabled={!ttsSupported}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4" />
                {currentLanguage === 'hi' ? 'आवाज़ बंद करें' : currentLanguage === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop Voice'}
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                {currentLanguage === 'hi' ? 'सुनें' : currentLanguage === 'kn' ? 'ಕೇಳಿ' : 'Listen'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonPlayer;
