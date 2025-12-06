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
  Loader2,
  Sparkles,
  Brain
} from 'lucide-react';
import LessonCard from './LessonCard';
import LessonPlayer from './LessonPlayer';
import VoiceQA from './VoiceQA';
import QuizSection from './QuizSection';
import PersonalizationPanel from './PersonalizationPanel';
import { useOfflineCache, CachedLesson } from '@/hooks/useOfflineCache';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EducationSectionProps {
  currentLanguage: string;
  translations: Record<string, unknown>;
}

const LESSON_TYPES = [
  { id: 'pest', en: 'Pest Control', hi: 'कीट नियंत्रण', kn: 'ಕೀಟ ನಿಯಂತ್ರಣ' },
  { id: 'disease', en: 'Disease Management', hi: 'रोग प्रबंधन', kn: 'ರೋಗ ನಿರ್ವಹಣೆ' },
  { id: 'prevention', en: 'Prevention Tips', hi: 'रोकथाम सुझाव', kn: 'ತಡೆಗಟ್ಟುವಿಕೆ ಸಲಹೆಗಳು' },
  { id: 'general', en: 'Best Practices', hi: 'सर्वोत्तम अभ्यास', kn: 'ಅತ್ಯುತ್ತಮ ಅಭ್ಯಾಸಗಳು' },
  { id: 'seasonal', en: 'Seasonal Care', hi: 'मौसमी देखभाल', kn: 'ಋತುಮಾನದ ಆರೈಕೆ' },
];

// Get current season
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 11 || month <= 2) return 'rabi';
  return 'zaid';
}

const EducationSection: React.FC<EducationSectionProps> = ({
  currentLanguage,
  translations,
}) => {
  // Personalization state
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [selectedRegion, setSelectedRegion] = useState<string>('karnataka');
  const [selectedSeason, setSelectedSeason] = useState<string>(getCurrentSeason());
  const [recentDiseases, setRecentDiseases] = useState<string[]>([]);
  
  // Lesson state
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

  // Load recent disease detections for personalization
  useEffect(() => {
    const loadDiseaseHistory = async () => {
      try {
        const { data } = await supabase
          .from('detection_history')
          .select('detection_result')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (data) {
          const diseases = data
            .map((d: any) => d.detection_result?.issue)
            .filter(Boolean)
            .slice(0, 3);
          setRecentDiseases(diseases);
        }
      } catch (error) {
        console.log('Could not load disease history');
      }
    };
    loadDiseaseHistory();
  }, []);

  // Generate a new personalized lesson
  const generateLesson = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: currentLanguage === 'hi' ? 'कनेक्शन आवश्यक' : currentLanguage === 'kn' ? 'ಸಂಪರ್ಕ ಅಗತ್ಯ' : 'Connection Required',
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
          region: selectedRegion,
          season: selectedSeason,
          diseaseHistory: recentDiseases,
          lessonType: selectedLessonType,
          difficulty: 'beginner',
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
        keyPoints_hi: data.keyPoints_hi,
        keyPoints_kn: data.keyPoints_kn,
        practicalTip: data.practicalTip,
        practicalTip_hi: data.practicalTip_hi,
        practicalTip_kn: data.practicalTip_kn,
        seasonalAdvice: data.seasonalAdvice,
        cachedAt: new Date().toISOString(),
        lessonType: selectedLessonType,
        difficulty: 'beginner',
        region: selectedRegion,
        season: selectedSeason,
      };

      setLessons((prev) => [newLesson, ...prev]);
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
  }, [isOnline, selectedCrop, selectedRegion, selectedSeason, selectedLessonType, recentDiseases, currentLanguage, cacheLesson, toast]);

  // Load cached lessons on mount
  useEffect(() => {
    if (cachedLessons.length > 0) {
      setLessons(cachedLessons);
    }
  }, [cachedLessons]);

  // Handle quiz completion
  const handleQuizComplete = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    toast({
      title: percentage >= 80 ? '🏆 ' : '📚 ' + (currentLanguage === 'hi' ? 'क्विज़ पूरा!' : currentLanguage === 'kn' ? 'ಕ್ವಿಜ್ ಪೂರ್ಣ!' : 'Quiz Complete!'),
      description: `${score}/${total} (${percentage}%)`,
    });
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
              ? 'आपकी फसल, आपके क्षेत्र और मौसम के अनुसार व्यक्तिगत पाठ' 
              : currentLanguage === 'kn'
              ? 'ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರದೇಶ ಮತ್ತು ಋತುವಿಗೆ ಅನುಗುಣವಾದ ವೈಯಕ್ತಿಕ ಪಾಠಗಳು'
              : 'Personalized lessons for your crop, region, and season'}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline">
              <Download className="h-3 w-3 mr-1" />
              {cachedLessons.length}/{maxCacheSize} {currentLanguage === 'hi' ? 'सहेजे गए' : currentLanguage === 'kn' ? 'ಉಳಿಸಲಾಗಿದೆ' : 'saved'}
            </Badge>
          </div>
        </div>

        {/* Personalization Panel */}
        <PersonalizationPanel
          currentLanguage={currentLanguage}
          selectedCrop={selectedCrop}
          selectedRegion={selectedRegion}
          selectedSeason={selectedSeason}
          recentDiseases={recentDiseases}
          onCropChange={setSelectedCrop}
          onRegionChange={setSelectedRegion}
          onSeasonChange={setSelectedSeason}
        />

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
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6">
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'पाठ' : currentLanguage === 'kn' ? 'ಪಾಠಗಳು' : 'Lessons'}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Brain className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'क्विज़' : currentLanguage === 'kn' ? 'ಕ್ವಿಜ್' : 'Quiz'}
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
                        {type.id === 'pest' && '🐛'}
                        {type.id === 'disease' && '🦠'}
                        {type.id === 'prevention' && '🛡️'}
                        {type.id === 'general' && '📚'}
                        {type.id === 'seasonal' && '🌤️'}
                        {' '}{getText(type)}
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
                      {currentLanguage === 'hi' ? '✨ AI पाठ बनाएं' : currentLanguage === 'kn' ? '✨ AI ಪಾಠ ರಚಿಸಿ' : '✨ Generate Personalized Lesson'}
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
                      : 'No lessons yet. Click the button above to generate your first personalized lesson!'}
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
                      onPlay={() => setActiveLesson(lesson)}
                      onCache={() => {
                        const success = cacheLesson(lesson);
                        if (success) {
                          toast({
                            title: '📥 ' + (currentLanguage === 'hi' ? 'सहेजा गया' : currentLanguage === 'kn' ? 'ಉಳಿಸಲಾಗಿದೆ' : 'Saved'),
                            description: currentLanguage === 'hi' 
                              ? 'बाद में देखने के लिए सहेजा गया' 
                              : currentLanguage === 'kn'
                              ? 'ನಂತರ ವೀಕ್ಷಣೆಗಾಗಿ ಉಳಿಸಲಾಗಿದೆ'
                              : 'Saved for later viewing',
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <QuizSection
              currentLanguage={currentLanguage}
              cropType={selectedCrop}
              lessonType={selectedLessonType}
              onComplete={handleQuizComplete}
            />
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
