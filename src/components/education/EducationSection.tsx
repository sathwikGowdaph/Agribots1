import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  GraduationCap, 
  MessageCircle, 
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Sparkles
} from 'lucide-react';
import LessonCard from './LessonCard';
import LessonPlayer from './LessonPlayer';
import VoiceQA from './VoiceQA';
import { useOfflineCache, CachedLesson } from '@/hooks/useOfflineCache';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EducationSectionProps {
  currentLanguage: string;
  translations: Record<string, string>;
}

// Crop types for lesson generation
const CROP_TYPES = [
  { id: 'tomato', emoji: '🍅', en: 'Tomato', hi: 'टमाटर', kn: 'ಟೊಮೆಟೊ' },
  { id: 'potato', emoji: '🥔', en: 'Potato', hi: 'आलू', kn: 'ಆಲೂಗಡ್ಡೆ' },
  { id: 'rice', emoji: '🌾', en: 'Rice/Paddy', hi: 'धान', kn: 'ಭತ್ತ' },
  { id: 'chili', emoji: '🌶️', en: 'Chili', hi: 'मिर्च', kn: 'ಮೆಣಸಿನಕಾಯಿ' },
  { id: 'cotton', emoji: '🏵️', en: 'Cotton', hi: 'कपास', kn: 'ಹತ್ತಿ' },
  { id: 'mango', emoji: '🥭', en: 'Mango', hi: 'आम', kn: 'ಮಾವು' },
  { id: 'banana', emoji: '🍌', en: 'Banana', hi: 'केला', kn: 'ಬಾಳೆಹಣ್ಣು' },
];

const LESSON_TYPES = [
  { id: 'pest', en: 'Pest Control', hi: 'कीट नियंत्रण', kn: 'ಕೀಟ ನಿಯಂತ್ರಣ' },
  { id: 'disease', en: 'Disease Management', hi: 'रोग प्रबंधन', kn: 'ರೋಗ ನಿರ್ವಹಣೆ' },
  { id: 'prevention', en: 'Prevention Tips', hi: 'रोकथाम सुझाव', kn: 'ತಡೆಗಟ್ಟುವಿಕೆ ಸಲಹೆಗಳು' },
  { id: 'general', en: 'Best Practices', hi: 'सर्वोत्तम अभ्यास', kn: 'ಅತ್ಯುತ್ತಮ ಅಭ್ಯಾಸಗಳು' },
];

const EducationSection: React.FC<EducationSectionProps> = ({
  currentLanguage,
  translations,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [selectedLessonType, setSelectedLessonType] = useState<string>('general');
  const [lessons, setLessons] = useState<CachedLesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLesson, setActiveLesson] = useState<CachedLesson | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');
  
  const { toast } = useToast();
  const { 
    isOnline, 
    cachedLessons, 
    cacheLesson, 
    getCachedLesson,
    maxCacheSize 
  } = useOfflineCache();

  // Get text in current language
  const getText = (item: { en: string; hi: string; kn: string }) => {
    switch (currentLanguage) {
      case 'hi': return item.hi;
      case 'kn': return item.kn;
      default: return item.en;
    }
  };

  // Generate a new lesson
  const generateLesson = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: currentLanguage === 'hi' ? 'ऑफ़लाइन' : currentLanguage === 'kn' ? 'ಆಫ್‌ಲೈನ್' : 'Offline',
        description: currentLanguage === 'hi' 
          ? 'नया पाठ बनाने के लिए इंटरनेट चाहिए' 
          : currentLanguage === 'kn'
          ? 'ಹೊಸ ಪಾಠ ರಚಿಸಲು ಇಂಟರ್ನೆಟ್ ಬೇಕು'
          : 'Internet required to generate new lesson',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          cropType: selectedCrop,
          lessonType: selectedLessonType,
          difficulty: 'beginner',
          region: 'India',
        },
      });

      if (error) throw error;

      const newLesson: CachedLesson = {
        id: Date.now().toString(),
        title: data.title || `${selectedCrop} Lesson`,
        title_hi: data.title_hi,
        title_kn: data.title_kn,
        content: data.content || '',
        content_hi: data.content_hi,
        content_kn: data.content_kn,
        cropType: selectedCrop,
        slides: data.slides,
        keyPoints: data.keyPoints,
        practicalTip: data.practicalTip,
        cachedAt: new Date().toISOString(),
        lessonType: selectedLessonType,
        difficulty: 'beginner',
      };

      setLessons((prev) => [newLesson, ...prev]);
      
      // Auto-cache the lesson
      cacheLesson(newLesson);

      toast({
        title: '✨ ' + (currentLanguage === 'hi' ? 'नया पाठ तैयार!' : currentLanguage === 'kn' ? 'ಹೊಸ ಪಾಠ ಸಿದ್ಧ!' : 'New Lesson Ready!'),
        description: newLesson.title,
      });
    } catch (error) {
      console.error('Lesson generation error:', error);
      toast({
        title: currentLanguage === 'hi' ? 'त्रुटि' : currentLanguage === 'kn' ? 'ದೋಷ' : 'Error',
        description: currentLanguage === 'hi' 
          ? 'पाठ बनाने में विफल' 
          : currentLanguage === 'kn'
          ? 'ಪಾಠ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ'
          : 'Failed to generate lesson',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isOnline, selectedCrop, selectedLessonType, currentLanguage, cacheLesson, toast]);

  // Load cached lessons on mount
  useEffect(() => {
    if (cachedLessons.length > 0) {
      setLessons(cachedLessons);
    }
  }, [cachedLessons]);

  // Play a lesson
  const handlePlayLesson = (lesson: CachedLesson) => {
    setActiveLesson(lesson);
  };

  // Cache a lesson for offline use
  const handleCacheLesson = (lesson: CachedLesson) => {
    const success = cacheLesson(lesson);
    if (success) {
      toast({
        title: '📥 ' + (currentLanguage === 'hi' ? 'सहेजा गया' : currentLanguage === 'kn' ? 'ಉಳಿಸಲಾಗಿದೆ' : 'Saved'),
        description: currentLanguage === 'hi' 
          ? 'ऑफ़लाइन उपयोग के लिए सहेजा गया' 
          : currentLanguage === 'kn'
          ? 'ಆಫ್‌ಲೈನ್ ಬಳಕೆಗಾಗಿ ಉಳಿಸಲಾಗಿದೆ'
          : 'Saved for offline use',
      });
    }
  };

  return (
    <section id="education" className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold font-heading">
              🎓 {currentLanguage === 'hi' ? 'AI शिक्षा केंद्र' : currentLanguage === 'kn' ? 'AI ಶಿಕ್ಷಣ ಕೇಂದ್ರ' : 'AI Education Hub'}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {currentLanguage === 'hi' 
              ? 'खेती सीखें AI की मदद से - आपकी भाषा में, आपकी फसल के लिए' 
              : currentLanguage === 'kn'
              ? 'AI ಸಹಾಯದಿಂದ ಕೃಷಿ ಕಲಿಯಿರಿ - ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ, ನಿಮ್ಮ ಬೆಳೆಗೆ'
              : 'Learn farming with AI - in your language, for your crops'}
          </p>
          
          {/* Online/Offline Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isOnline ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Wifi className="h-3 w-3 mr-1" />
                {currentLanguage === 'hi' ? 'ऑनलाइन' : currentLanguage === 'kn' ? 'ಆನ್‌ಲೈನ್' : 'Online'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <WifiOff className="h-3 w-3 mr-1" />
                {currentLanguage === 'hi' ? 'ऑफ़लाइन' : currentLanguage === 'kn' ? 'ಆಫ್‌ಲೈನ್' : 'Offline'}
              </Badge>
            )}
            <Badge variant="outline">
              <Download className="h-3 w-3 mr-1" />
              {cachedLessons.length}/{maxCacheSize} {currentLanguage === 'hi' ? 'सहेजे गए' : currentLanguage === 'kn' ? 'ಉಳಿಸಲಾಗಿದೆ' : 'cached'}
            </Badge>
          </div>
        </div>

        {/* Active Lesson Player */}
        {activeLesson && (
          <div className="mb-8">
            <LessonPlayer
              lesson={activeLesson}
              currentLanguage={currentLanguage}
              onClose={() => setActiveLesson(null)}
              onComplete={() => {
                toast({
                  title: '🎉 ' + (currentLanguage === 'hi' ? 'पाठ पूरा!' : currentLanguage === 'kn' ? 'ಪಾಠ ಪೂರ್ಣ!' : 'Lesson Complete!'),
                });
              }}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'पाठ' : currentLanguage === 'kn' ? 'ಪಾಠಗಳು' : 'Lessons'}
            </TabsTrigger>
            <TabsTrigger value="qa" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'प्रश्नोत्तर' : currentLanguage === 'kn' ? 'ಪ್ರಶ್ನೋತ್ತರ' : 'Q&A'}
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {/* Lesson Generator Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {currentLanguage === 'hi' ? 'नया पाठ बनाएं' : currentLanguage === 'kn' ? 'ಹೊಸ ಪಾಠ ರಚಿಸಿ' : 'Generate New Lesson'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Crop Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {currentLanguage === 'hi' ? 'फसल चुनें' : currentLanguage === 'kn' ? 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ' : 'Select Crop'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CROP_TYPES.map((crop) => (
                      <Button
                        key={crop.id}
                        variant={selectedCrop === crop.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCrop(crop.id)}
                        className="gap-1"
                      >
                        {crop.emoji} {getText(crop)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Lesson Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {currentLanguage === 'hi' ? 'विषय चुनें' : currentLanguage === 'kn' ? 'ವಿಷಯ ಆಯ್ಕೆಮಾಡಿ' : 'Select Topic'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LESSON_TYPES.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedLessonType === type.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLessonType(type.id)}
                      >
                        {getText(type)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  variant="farmer"
                  size="lg"
                  className="w-full gap-2"
                  onClick={generateLesson}
                  disabled={isGenerating || !isOnline}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {currentLanguage === 'hi' ? 'बना रहा है...' : currentLanguage === 'kn' ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      {currentLanguage === 'hi' ? '✨ AI पाठ बनाएं' : currentLanguage === 'kn' ? '✨ AI ಪಾಠ ರಚಿಸಿ' : '✨ Generate AI Lesson'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Lessons Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {currentLanguage === 'hi' ? 'आपके पाठ' : currentLanguage === 'kn' ? 'ನಿಮ್ಮ ಪಾಠಗಳು' : 'Your Lessons'}
                <Badge variant="secondary">{lessons.length}</Badge>
              </h3>

              {lessons.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {currentLanguage === 'hi' 
                      ? 'अभी कोई पाठ नहीं। ऊपर बटन दबाकर नया पाठ बनाएं!' 
                      : currentLanguage === 'kn'
                      ? 'ಇನ್ನೂ ಯಾವುದೇ ಪಾಠಗಳಿಲ್ಲ. ಹೊಸ ಪಾಠವನ್ನು ರಚಿಸಲು ಮೇಲಿನ ಬಟನ್ ಒತ್ತಿರಿ!'
                      : 'No lessons yet. Click the button above to generate your first lesson!'}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      currentLanguage={currentLanguage}
                      isCached={!!getCachedLesson(lesson.id)}
                      onPlay={handlePlayLesson}
                      onCache={handleCacheLesson}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa">
            <VoiceQA
              currentLanguage={currentLanguage}
              cropType={selectedCrop}
              translations={translations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default EducationSection;
