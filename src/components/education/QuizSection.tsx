import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Loader2,
  Volume2,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  question: string;
  question_hi?: string;
  question_kn?: string;
  options: string[];
  options_hi?: string[];
  options_kn?: string[];
  correctIndex: number;
  explanation: string;
  explanation_hi?: string;
  explanation_kn?: string;
}

interface QuizSectionProps {
  currentLanguage: string;
  cropType: string;
  lessonType: string;
  onComplete?: (score: number, total: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  currentLanguage,
  cropType,
  lessonType,
  onComplete,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const { speak, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();
  const { toast } = useToast();

  // Get text in current language
  const getText = useCallback((en?: string, hi?: string, kn?: string): string => {
    switch (currentLanguage) {
      case 'hi': return hi || en || '';
      case 'kn': return kn || en || '';
      default: return en || '';
    }
  }, [currentLanguage]);

  // Generate quiz
  const generateQuiz = async () => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setQuizComplete(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          cropType,
          lessonType,
          numQuestions: 5,
        },
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid quiz data');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast({
        title: getText('Error', 'त्रुटि', 'ದೋಷ'),
        description: getText(
          'Failed to generate quiz. Please try again.',
          'क्विज़ बनाने में विफल। कृपया पुनः प्रयास करें।',
          'ಕ್ವಿಜ್ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
        ),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  // Submit answer
  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setShowResult(true);

    // Speak explanation
    if (ttsSupported) {
      const explanation = getText(
        questions[currentIndex].explanation,
        questions[currentIndex].explanation_hi,
        questions[currentIndex].explanation_kn
      );
      speak(explanation, currentLanguage);
    }
  };

  // Next question
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      onComplete?.(score, questions.length);
    }
  };

  // Speak question
  const speakQuestion = () => {
    if (!ttsSupported || !questions[currentIndex]) return;
    const questionText = getText(
      questions[currentIndex].question,
      questions[currentIndex].question_hi,
      questions[currentIndex].question_kn
    );
    speak(questionText, currentLanguage);
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Get options in current language
  const getOptions = (q: QuizQuestion): string[] => {
    switch (currentLanguage) {
      case 'hi': return q.options_hi || q.options;
      case 'kn': return q.options_kn || q.options;
      default: return q.options;
    }
  };

  if (questions.length === 0 && !isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            🧠 {getText('Test Your Knowledge', 'अपना ज्ञान परखें', 'ನಿಮ್ಮ ಜ್ಞಾನವನ್ನು ಪರೀಕ್ಷಿಸಿ')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {getText(
              `Take a quick quiz about ${cropType} farming!`,
              `${cropType} खेती के बारे में एक त्वरित क्विज़ लें!`,
              `${cropType} ಕೃಷಿ ಬಗ್ಗೆ ತ್ವರಿತ ಕ್ವಿಜ್ ತೆಗೆದುಕೊಳ್ಳಿ!`
            )}
          </p>
          <Button variant="farmer" size="lg" onClick={generateQuiz} className="gap-2">
            <Brain className="h-5 w-5" />
            {getText('Start Quiz', 'क्विज़ शुरू करें', 'ಕ್ವಿಜ್ ಪ್ರಾರಂಭಿಸಿ')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">
            {getText('Generating quiz...', 'क्विज़ बनाया जा रहा है...', 'ಕ್ವಿಜ್ ರಚಿಸಲಾಗುತ್ತಿದೆ...')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚';
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className={`h-8 w-8 ${percentage >= 80 ? 'text-yellow-500' : 'text-primary'}`} />
            {emoji} {getText('Quiz Complete!', 'क्विज़ पूरा!', 'ಕ್ವಿಜ್ ಪೂರ್ಣ!')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-5xl font-bold text-primary">
            {score}/{questions.length}
          </div>
          <p className="text-lg text-muted-foreground">
            {percentage >= 80
              ? getText('Excellent! You are a farming expert! 🌟', 'उत्कृष्ट! आप एक कृषि विशेषज्ञ हैं! 🌟', 'ಅತ್ಯುತ್ತಮ! ನೀವು ಕೃಷಿ ತಜ್ಞರು! 🌟')
              : percentage >= 60
              ? getText('Good job! Keep learning! 📚', 'अच्छा काम! सीखते रहें! 📚', 'ಒಳ್ಳೆಯ ಕೆಲಸ! ಕಲಿಯುತ್ತಿರಿ! 📚')
              : getText('Keep practicing! You will improve! 💪', 'अभ्यास जारी रखें! आप सुधरेंगे! 💪', 'ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿ! ನೀವು ಸುಧಾರಿಸುತ್ತೀರಿ! 💪')}
          </p>
          <Button variant="farmer" onClick={generateQuiz} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {getText('Try Again', 'पुनः प्रयास करें', 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {getText(`Question ${currentIndex + 1} of ${questions.length}`, 
              `प्रश्न ${currentIndex + 1} / ${questions.length}`, 
              `ಪ್ರಶ್ನೆ ${currentIndex + 1} / ${questions.length}`)}
          </Badge>
          <Badge variant="secondary">
            🏆 {score}/{questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold">
              {getText(
                currentQuestion?.question,
                currentQuestion?.question_hi,
                currentQuestion?.question_kn
              )}
            </h3>
            {ttsSupported && (
              <Button variant="ghost" size="icon" onClick={speakQuestion}>
                <Volume2 className={`h-5 w-5 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentQuestion && getOptions(currentQuestion).map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showCorrectness = showResult;

            return (
              <Button
                key={idx}
                variant="outline"
                className={`w-full justify-start text-left h-auto py-3 px-4 ${
                  isSelected ? 'border-primary border-2' : ''
                } ${
                  showCorrectness && isCorrect
                    ? 'bg-green-100 border-green-500 dark:bg-green-900/30'
                    : ''
                } ${
                  showCorrectness && isSelected && !isCorrect
                    ? 'bg-red-100 border-red-500 dark:bg-red-900/30'
                    : ''
                }`}
                onClick={() => handleAnswerSelect(idx)}
                disabled={showResult}
              >
                <span className="flex items-center gap-2">
                  {showCorrectness && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {showCorrectness && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                  {!showCorrectness && <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm">{String.fromCharCode(65 + idx)}</span>}
                  <span>{option}</span>
                </span>
              </Button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && currentQuestion && (
          <div className={`p-4 rounded-lg ${
            selectedAnswer === currentQuestion.correctIndex
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}>
            <p className="text-sm">
              💡 {getText(
                currentQuestion.explanation,
                currentQuestion.explanation_hi,
                currentQuestion.explanation_kn
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {!showResult ? (
            <Button
              variant="farmer"
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="gap-2"
            >
              {getText('Submit', 'जमा करें', 'ಸಲ್ಲಿಸಿ')}
            </Button>
          ) : (
            <Button variant="farmer" onClick={nextQuestion} className="gap-2">
              {currentIndex < questions.length - 1 ? (
                <>
                  {getText('Next', 'अगला', 'ಮುಂದೆ')}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                getText('See Results', 'परिणाम देखें', 'ಫಲಿತಾಂಶ ನೋಡಿ')
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSection;
