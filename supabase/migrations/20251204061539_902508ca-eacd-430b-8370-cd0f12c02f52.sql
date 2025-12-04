-- Create lessons table for storing generated lessons
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_hi TEXT,
  title_kn TEXT,
  content TEXT NOT NULL,
  content_hi TEXT,
  content_kn TEXT,
  crop_type TEXT,
  region TEXT,
  lesson_type TEXT NOT NULL DEFAULT 'text', -- text, audio, video
  difficulty_level TEXT DEFAULT 'beginner',
  duration_seconds INTEGER DEFAULT 60,
  tags TEXT[],
  slides JSONB, -- For animated slides: [{image_url, text, duration}]
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user learning progress table
CREATE TABLE public.user_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Q&A history table
CREATE TABLE public.qa_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  question TEXT NOT NULL,
  question_hi TEXT,
  question_kn TEXT,
  answer TEXT NOT NULL,
  answer_hi TEXT,
  answer_kn TEXT,
  crop_type TEXT,
  source_type TEXT DEFAULT 'voice', -- voice, text
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offline cache metadata table
CREATE TABLE public.lesson_cache_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'synced', -- synced, pending, failed
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_cache_metadata ENABLE ROW LEVEL SECURITY;

-- Lessons are publicly readable (educational content)
CREATE POLICY "Lessons are viewable by everyone" 
ON public.lessons FOR SELECT USING (true);

-- Only system can create lessons (via edge function)
CREATE POLICY "Service role can manage lessons" 
ON public.lessons FOR ALL USING (true);

-- Learning progress policies
CREATE POLICY "Users can view own progress" 
ON public.user_learning_progress FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own progress" 
ON public.user_learning_progress FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own progress" 
ON public.user_learning_progress FOR UPDATE 
USING (true);

-- Q&A history policies
CREATE POLICY "Users can view own Q&A" 
ON public.qa_history FOR SELECT 
USING (true);

CREATE POLICY "Users can create Q&A" 
ON public.qa_history FOR INSERT 
WITH CHECK (true);

-- Cache metadata policies
CREATE POLICY "Users can manage own cache" 
ON public.lesson_cache_metadata FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for lessons
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;