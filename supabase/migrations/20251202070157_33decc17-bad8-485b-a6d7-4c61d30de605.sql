-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true);

-- Create storage bucket for detection history images
INSERT INTO storage.buckets (id, name, public)
VALUES ('detection-images', 'detection-images', true);

-- Storage policies for community images
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own community images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for detection images
CREATE POLICY "Users can view their own detection images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'detection-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can upload detection images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'detection-images' AND
  auth.uid() IS NOT NULL
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  crop_type TEXT,
  issue_detected TEXT,
  solutions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderation_note TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community likes table
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create detection history table
CREATE TABLE public.detection_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detection_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view approved posts"
ON public.community_posts FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can view their own posts"
ON public.community_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts"
ON public.community_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for community_comments
CREATE POLICY "Anyone can view comments on approved posts"
ON public.community_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts
    WHERE id = post_id AND status = 'approved'
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.community_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.community_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for community_likes
CREATE POLICY "Anyone can view likes"
ON public.community_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create likes"
ON public.community_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.community_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for detection_history
CREATE POLICY "Users can view their own detection history"
ON public.detection_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detection history"
ON public.detection_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detection history"
ON public.detection_history FOR DELETE
USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for community_posts
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
CREATE TRIGGER increment_comments_count_trigger
AFTER INSERT ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.increment_comments_count();

-- Function to decrement comments count
CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET comments_count = comments_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count decrement
CREATE TRIGGER decrement_comments_count_trigger
AFTER DELETE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.decrement_comments_count();

-- Function to increment likes count
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
CREATE TRIGGER increment_likes_count_trigger
AFTER INSERT ON public.community_likes
FOR EACH ROW
EXECUTE FUNCTION public.increment_likes_count();

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = likes_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count decrement
CREATE TRIGGER decrement_likes_count_trigger
AFTER DELETE ON public.community_likes
FOR EACH ROW
EXECUTE FUNCTION public.decrement_likes_count();

-- Function to auto-delete old detection history (3 days)
CREATE OR REPLACE FUNCTION public.delete_old_detection_history()
RETURNS void AS $$
BEGIN
  DELETE FROM public.detection_history
  WHERE created_at < now() - interval '3 days';
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX idx_detection_history_created_at ON public.detection_history(created_at);
CREATE INDEX idx_community_posts_status ON public.community_posts(status);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);

-- Enable realtime for community features
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;