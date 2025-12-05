import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Volume2, Play, Clock, Download, CheckCircle } from 'lucide-react';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    title_hi?: string;
    title_kn?: string;
    cropType?: string;
    lessonType?: string;
    difficulty?: string;
    durationSeconds?: number;
    keyPoints?: string[];
  };
  currentLanguage: string;
  isCompleted?: boolean;
  isCached?: boolean;
  onPlay: (lesson: LessonCardProps['lesson']) => void;
  onCache?: (lesson: LessonCardProps['lesson']) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  currentLanguage,
  isCompleted,
  isCached,
  onPlay,
  onCache,
}) => {
  // Get title in current language
  const getTitle = () => {
    switch (currentLanguage) {
      case 'hi':
        return lesson.title_hi || lesson.title;
      case 'kn':
        return lesson.title_kn || lesson.title;
      default:
        return lesson.title;
    }
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '1 min';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.ceil(seconds / 60)} min`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="line-clamp-2">{getTitle()}</span>
            </CardTitle>
          </div>
          {isCompleted && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {lesson.cropType && (
            <Badge variant="secondary" className="text-xs">
              🌾 {lesson.cropType}
            </Badge>
          )}
          {lesson.difficulty && (
            <Badge className={`text-xs ${getDifficultyColor(lesson.difficulty)}`}>
              {lesson.difficulty}
            </Badge>
          )}
          {lesson.lessonType && (
            <Badge variant="outline" className="text-xs">
              {lesson.lessonType === 'pest' && '🐛'}
              {lesson.lessonType === 'disease' && '🦠'}
              {lesson.lessonType === 'general' && '📚'}
              {lesson.lessonType === 'prevention' && '🛡️'}
              {lesson.lessonType}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Key points preview */}
        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <ul className="text-sm text-muted-foreground mb-3 space-y-1">
            {lesson.keyPoints.slice(0, 2).map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-primary">•</span>
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Duration and actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(lesson.durationSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            {onCache && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCache(lesson)}
                className={isCached ? 'text-green-600' : ''}
                title={isCached ? 'Saved' : 'Save for later'}
              >
                <Download className={`h-4 w-4 ${isCached ? 'fill-current' : ''}`} />
              </Button>
            )}
            <Button
              variant="farmer"
              size="sm"
              onClick={() => onPlay(lesson)}
              className="gap-1"
            >
              <Play className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'सीखें' : currentLanguage === 'kn' ? 'ಕಲಿಯಿರಿ' : 'Learn'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
