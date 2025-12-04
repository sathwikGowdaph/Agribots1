import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'agribot_lessons_cache';
const MAX_CACHED_LESSONS = 20;
const SYNC_QUEUE_KEY = 'agribot_sync_queue';

export interface CachedLesson {
  id: string;
  title: string;
  title_hi?: string;
  title_kn?: string;
  content: string;
  content_hi?: string;
  content_kn?: string;
  cropType?: string;
  slides?: Array<{
    title: string;
    text: string;
    text_hi?: string;
    text_kn?: string;
    emoji: string;
    duration: number;
  }>;
  keyPoints?: string[];
  practicalTip?: string;
  cachedAt: string;
  lessonType?: string;
  difficulty?: string;
}

interface SyncQueueItem {
  type: 'lesson_progress' | 'qa_history';
  data: Record<string, unknown>;
  timestamp: string;
}

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedLessons, setCachedLessons] = useState<CachedLesson[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached lessons from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const lessons = JSON.parse(cached) as CachedLesson[];
        setCachedLessons(lessons);
      }

      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      if (queue) {
        setSyncQueue(JSON.parse(queue));
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }, []);

  // Cache a lesson
  const cacheLesson = useCallback((lesson: Omit<CachedLesson, 'cachedAt'>) => {
    try {
      const newLesson: CachedLesson = {
        ...lesson,
        cachedAt: new Date().toISOString(),
      };

      setCachedLessons((prev) => {
        // Check if lesson already exists
        const exists = prev.find((l) => l.id === lesson.id);
        let updated: CachedLesson[];

        if (exists) {
          // Update existing
          updated = prev.map((l) => (l.id === lesson.id ? newLesson : l));
        } else {
          // Add new, remove oldest if over limit
          updated = [newLesson, ...prev];
          if (updated.length > MAX_CACHED_LESSONS) {
            updated = updated.slice(0, MAX_CACHED_LESSONS);
          }
        }

        // Save to localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      console.log('Lesson cached:', lesson.title);
      return true;
    } catch (error) {
      console.error('Error caching lesson:', error);
      return false;
    }
  }, []);

  // Get lesson from cache
  const getCachedLesson = useCallback(
    (id: string): CachedLesson | undefined => {
      return cachedLessons.find((l) => l.id === id);
    },
    [cachedLessons]
  );

  // Remove lesson from cache
  const removeCachedLesson = useCallback((id: string) => {
    setCachedLessons((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all cached lessons
  const clearCache = useCallback(() => {
    setCachedLessons([]);
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Add item to sync queue (for offline actions)
  const addToSyncQueue = useCallback((item: Omit<SyncQueueItem, 'timestamp'>) => {
    const newItem: SyncQueueItem = {
      ...item,
      timestamp: new Date().toISOString(),
    };

    setSyncQueue((prev) => {
      const updated = [...prev, newItem];
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Process sync queue when online
  const processSyncQueue = useCallback(async () => {
    if (!isOnline || syncQueue.length === 0) return;

    console.log('Processing sync queue:', syncQueue.length, 'items');
    
    // For now, just clear the queue - implement actual sync when backend is ready
    setSyncQueue([]);
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }, [isOnline, syncQueue]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      processSyncQueue();
    }
  }, [isOnline, processSyncQueue]);

  return {
    isOnline,
    cachedLessons,
    cacheLesson,
    getCachedLesson,
    removeCachedLesson,
    clearCache,
    addToSyncQueue,
    syncQueueSize: syncQueue.length,
    maxCacheSize: MAX_CACHED_LESSONS,
  };
}
