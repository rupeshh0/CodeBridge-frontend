-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Set up Row Level Security (RLS)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

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

-- Set up Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

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

-- Insert sample data
-- Insert forum categories
INSERT INTO forum_categories (name, description, slug)
VALUES
  ('General', 'General discussion about programming and coding', 'general'),
  ('JavaScript', 'Discussion about JavaScript programming language', 'javascript'),
  ('Python', 'Discussion about Python programming language', 'python'),
  ('Java', 'Discussion about Java programming language', 'java'),
  ('C++', 'Discussion about C++ programming language', 'cpp'),
  ('Web Development', 'Discussion about web development', 'web-development'),
  ('Data Structures', 'Discussion about data structures', 'data-structures'),
  ('Algorithms', 'Discussion about algorithms', 'algorithms'),
  ('Help & Support', 'Get help with coding problems', 'help-support');

-- Insert tasks
INSERT INTO tasks (title, description, difficulty, category, languages, initial_code, test_cases, solution, hints)
VALUES
  (
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    'easy',
    ARRAY['algorithms', 'arrays'],
    ARRAY['javascript', 'python', 'java', 'cpp'],
    '{"javascript": "function twoSum(nums, target) {\n  // Your code here\n}", "python": "def two_sum(nums, target):\n    # Your code here\n    pass", "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}", "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};"}',
    '[{"input": "[2,7,11,15], 9", "expected_output": "[0,1]"}, {"input": "[3,2,4], 6", "expected_output": "[1,2]"}, {"input": "[3,3], 6", "expected_output": "[0,1]"}]',
    '{"javascript": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}", "python": "def two_sum(nums, target):\n    map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in map:\n            return [map[complement], i]\n        map[num] = i\n    return []", "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}", "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.find(complement) != map.end()) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};"}',
    ARRAY['Try using a hash map to store the numbers you have seen so far', 'For each number, check if its complement (target - num) is in the hash map', 'If you find the complement, return the indices of the two numbers']
  ),
  (
    'Reverse a String',
    'Write a function that reverses a string. The input string is given as an array of characters.',
    'easy',
    ARRAY['algorithms', 'strings'],
    ARRAY['javascript', 'python', 'java', 'cpp'],
    '{"javascript": "function reverseString(s) {\n  // Your code here\n}", "python": "def reverse_string(s):\n    # Your code here\n    pass", "java": "class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}", "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};"}',
    '[{"input": "[\\"h\\",\\"e\\",\\"l\\",\\"l\\",\\"o\\"]", "expected_output": "[\\"o\\",\\"l\\",\\"l\\",\\"e\\",\\"h\\"]"}, {"input": "[\\"H\\",\\"a\\",\\"n\\",\\"n\\",\\"a\\",\\"h\\"]", "expected_output": "[\\"h\\",\\"a\\",\\"n\\",\\"n\\",\\"a\\",\\"H\\"]"}]',
    '{"javascript": "function reverseString(s) {\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n  return s;\n}", "python": "def reverse_string(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1\n    return s", "java": "class Solution {\n    public void reverseString(char[] s) {\n        int left = 0;\n        int right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++;\n            right--;\n        }\n    }\n}", "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        int left = 0;\n        int right = s.size() - 1;\n        while (left < right) {\n            swap(s[left], s[right]);\n            left++;\n            right--;\n        }\n    }\n};"}',
    ARRAY['Try using two pointers, one at the beginning and one at the end', 'Swap the characters at the two pointers', 'Move the pointers towards the middle']
  );

-- Insert courses
INSERT INTO courses (title, description, slug, level, category, tags, image_url, duration_hours)
VALUES
  (
    'JavaScript Fundamentals',
    'Learn the fundamentals of JavaScript programming language, including variables, data types, functions, and control flow.',
    'javascript-fundamentals',
    'beginner',
    'javascript',
    ARRAY['javascript', 'web-development', 'programming'],
    'https://example.com/images/javascript-fundamentals.jpg',
    10
  ),
  (
    'Python for Beginners',
    'Learn the basics of Python programming language, including variables, data types, functions, and control flow.',
    'python-for-beginners',
    'beginner',
    'python',
    ARRAY['python', 'programming'],
    'https://example.com/images/python-for-beginners.jpg',
    8
  );

-- Insert modules for JavaScript Fundamentals course
INSERT INTO modules (course_id, title, description, order_index)
VALUES
  (
    (SELECT id FROM courses WHERE slug = 'javascript-fundamentals'),
    'Introduction to JavaScript',
    'Learn about the history of JavaScript, its role in web development, and how to set up your development environment.',
    1
  ),
  (
    (SELECT id FROM courses WHERE slug = 'javascript-fundamentals'),
    'Variables and Data Types',
    'Learn about variables, data types, and operators in JavaScript.',
    2
  );

-- Insert lessons for Introduction to JavaScript module
INSERT INTO lessons (module_id, title, content, order_index, type, duration_minutes)
VALUES
  (
    (SELECT id FROM modules WHERE title = 'Introduction to JavaScript' AND course_id = (SELECT id FROM courses WHERE slug = 'javascript-fundamentals')),
    'What is JavaScript?',
    'JavaScript is a programming language that was created in 1995 by Brendan Eich while he was working at Netscape Communications Corporation. It was originally designed to add interactivity to web pages, but it has since evolved into a versatile language that can be used for a wide range of applications, including web development, server-side programming, mobile app development, and more.',
    1,
    'text',
    10
  ),
  (
    (SELECT id FROM modules WHERE title = 'Introduction to JavaScript' AND course_id = (SELECT id FROM courses WHERE slug = 'javascript-fundamentals')),
    'Setting Up Your Development Environment',
    'To start coding in JavaScript, you need a text editor and a web browser. Popular text editors include Visual Studio Code, Sublime Text, and Atom. You can also use online code editors like CodePen, JSFiddle, or Replit.',
    2,
    'text',
    15
  );
