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
