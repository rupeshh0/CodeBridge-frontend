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
