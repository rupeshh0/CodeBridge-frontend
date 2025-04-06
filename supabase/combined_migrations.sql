-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{"github": null, "twitter": null, "linkedin": null}'::JSONB,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  completed_tasks INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  initial_code JSONB NOT NULL,
  test_cases JSONB NOT NULL,
  solution JSONB NOT NULL,
  hints TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  execution_time FLOAT DEFAULT 0,
  memory_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (task_id, user_id, created_at)
);

-- Set up Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
-- Tasks are viewable by everyone
CREATE POLICY "Tasks are viewable by everyone"
  ON tasks FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete tasks
CREATE POLICY "Only admins can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can update tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can delete tasks"
  ON tasks FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Create policies for task_submissions
-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON task_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON task_submissions FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
  ON task_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user stats on successful submission
CREATE OR REPLACE FUNCTION public.update_user_stats_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stats for successful submissions
  IF NEW.status = 'success' THEN
    -- Check if this is the first successful submission for this task
    IF NOT EXISTS (
      SELECT 1 FROM task_submissions
      WHERE task_id = NEW.task_id
        AND user_id = NEW.user_id
        AND status = 'success'
        AND id != NEW.id
    ) THEN
      -- Update user stats
      UPDATE profiles
      SET 
        completed_tasks = completed_tasks + 1,
        points = points + (
          CASE 
            WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'easy' THEN 10
            WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'medium' THEN 20
            WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'hard' THEN 30
            ELSE 0
          END
        )
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task submission
CREATE OR REPLACE TRIGGER on_task_submission
  AFTER INSERT ON task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_submission();
-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_post_likes table
CREATE TABLE IF NOT EXISTS forum_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- Create forum_comment_likes table
CREATE TABLE IF NOT EXISTS forum_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (comment_id, user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_categories
-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone"
  ON forum_categories FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete categories
CREATE POLICY "Only admins can insert categories"
  ON forum_categories FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can update categories"
  ON forum_categories FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can delete categories"
  ON forum_categories FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Create policies for forum_posts
-- Posts are viewable by everyone
CREATE POLICY "Posts are viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can insert their own posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for forum_comments
-- Comments are viewable by everyone
CREATE POLICY "Comments are viewable by everyone"
  ON forum_comments FOR SELECT
  USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON forum_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON forum_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON forum_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for forum_post_likes
-- Post likes are viewable by everyone
CREATE POLICY "Post likes are viewable by everyone"
  ON forum_post_likes FOR SELECT
  USING (true);

-- Users can insert their own post likes
CREATE POLICY "Users can insert their own post likes"
  ON forum_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own post likes
CREATE POLICY "Users can delete their own post likes"
  ON forum_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for forum_comment_likes
-- Comment likes are viewable by everyone
CREATE POLICY "Comment likes are viewable by everyone"
  ON forum_comment_likes FOR SELECT
  USING (true);

-- Users can insert their own comment likes
CREATE POLICY "Users can insert their own comment likes"
  ON forum_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comment likes
CREATE POLICY "Users can delete their own comment likes"
  ON forum_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create functions to update counts
-- Function to update post count in category
CREATE OR REPLACE FUNCTION public.update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories
    SET post_count = post_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories
    SET post_count = post_count - 1
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment count in post
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update like count in post
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET like_count = like_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update like count in comment
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_comments
    SET like_count = like_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_comments
    SET like_count = like_count - 1
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_forum_post_change
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_post_count();

CREATE TRIGGER on_forum_comment_change
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER on_forum_post_like_change
  AFTER INSERT OR DELETE ON forum_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE TRIGGER on_forum_comment_like_change
  AFTER INSERT OR DELETE ON forum_comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_like_count();
-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  duration_hours INTEGER DEFAULT 0,
  module_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  lesson_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (course_id, order_index)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'video', 'quiz', 'task')),
  duration_minutes INTEGER DEFAULT 0,
  video_url TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (module_id, order_index)
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons UUID[] DEFAULT '{}',
  completed_modules UUID[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  progress_percentage FLOAT DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
-- Courses are viewable by everyone
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete courses
CREATE POLICY "Only admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can update courses"
  ON courses FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can delete courses"
  ON courses FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Create policies for modules
-- Modules are viewable by everyone
CREATE POLICY "Modules are viewable by everyone"
  ON modules FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete modules
CREATE POLICY "Only admins can insert modules"
  ON modules FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can update modules"
  ON modules FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can delete modules"
  ON modules FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Create policies for lessons
-- Lessons are viewable by everyone
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete lessons
CREATE POLICY "Only admins can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can update lessons"
  ON lessons FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

CREATE POLICY "Only admins can delete lessons"
  ON lessons FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Create policies for user_progress
-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE username = 'admin'
  ));

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions to update counts
-- Function to update module count in course
CREATE OR REPLACE FUNCTION public.update_course_module_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses
    SET module_count = module_count + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses
    SET module_count = module_count - 1
    WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update lesson count in module
CREATE OR REPLACE FUNCTION public.update_module_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE modules
    SET lesson_count = lesson_count + 1
    WHERE id = NEW.module_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE modules
    SET lesson_count = lesson_count - 1
    WHERE id = OLD.module_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_module_change
  AFTER INSERT OR DELETE ON modules
  FOR EACH ROW EXECUTE FUNCTION public.update_course_module_count();

CREATE TRIGGER on_lesson_change
  AFTER INSERT OR DELETE ON lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_module_lesson_count();
