import { supabase } from '@/lib/supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  tags: string[];
  image_url?: string;
  duration_hours: number;
  module_count: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lesson_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'video' | 'quiz' | 'task';
  duration_minutes: number;
  video_url?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  user_id: string;
  course_id: string;
  completed_lessons: string[];
  completed_modules: string[];
  is_completed: boolean;
  progress_percentage: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export const curriculumService = {
  getCourses: async (
    category?: string,
    level?: string,
    searchQuery?: string,
    tags?: string[]
  ): Promise<Course[]> => {
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (level) {
        query = query.eq('level', level);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (tags && tags.length > 0) {
        // This is a simplification - actual implementation would depend on how tags are stored
        query = query.contains('tags', tags);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  },

  getCourseBySlug: async (slug: string): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Get course ${slug} error:`, error);
      throw error;
    }
  },

  getModules: async (courseId: string): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Get modules for course ${courseId} error:`, error);
      throw error;
    }
  },

  getLessons: async (moduleId: string): Promise<Lesson[]> => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Get lessons for module ${moduleId} error:`, error);
      throw error;
    }
  },

  getLesson: async (lessonId: string): Promise<Lesson | null> => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Get lesson ${lessonId} error:`, error);
      throw error;
    }
  },

  getUserProgress: async (userId: string, courseId: string): Promise<UserProgress | null> => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error(`Get user ${userId} progress for course ${courseId} error:`, error);
      throw error;
    }
  },

  updateUserProgress: async (
    userId: string,
    courseId: string,
    lessonId: string,
    isCompleted: boolean
  ): Promise<UserProgress> => {
    try {
      // Get current progress
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      // Get lesson to find its module
      const { data: lesson } = await supabase
        .from('lessons')
        .select('module_id')
        .eq('id', lessonId)
        .single();

      if (!lesson) {
        throw new Error(`Lesson ${lessonId} not found`);
      }

      // Get all lessons in the module
      const { data: moduleLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', lesson.module_id);

      // Get all modules in the course
      const { data: courseModules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      let completedLessons = currentProgress?.completed_lessons || [];
      let completedModules = currentProgress?.completed_modules || [];

      if (isCompleted && !completedLessons.includes(lessonId)) {
        completedLessons = [...completedLessons, lessonId];
      } else if (!isCompleted && completedLessons.includes(lessonId)) {
        completedLessons = completedLessons.filter(id => id !== lessonId);
      }

      // Check if all lessons in the module are completed
      const allModuleLessonsCompleted = moduleLessons?.every(l => completedLessons.includes(l.id));
      
      if (allModuleLessonsCompleted && !completedModules.includes(lesson.module_id)) {
        completedModules = [...completedModules, lesson.module_id];
      } else if (!allModuleLessonsCompleted && completedModules.includes(lesson.module_id)) {
        completedModules = completedModules.filter(id => id !== lesson.module_id);
      }

      // Calculate progress percentage
      const totalLessons = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('module_id', lesson.module_id);
      
      const progressPercentage = totalLessons.count ? 
        (completedLessons.length / totalLessons.count) * 100 : 0;

      // Check if the entire course is completed
      const isCourseCompleted = courseModules?.every(m => completedModules.includes(m.id));

      const progressData = {
        user_id: userId,
        course_id: courseId,
        completed_lessons: completedLessons,
        completed_modules: completedModules,
        is_completed: isCourseCompleted,
        progress_percentage: progressPercentage,
        last_accessed_at: new Date().toISOString(),
      };

      let result;

      if (currentProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        result = data;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('user_progress')
          .insert([progressData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        result = data;
      }

      return result;
    } catch (error) {
      console.error(`Update user ${userId} progress for course ${courseId} error:`, error);
      throw error;
    }
  },
};
