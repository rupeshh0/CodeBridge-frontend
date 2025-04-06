-- Database Improvements for KodeLab

-- Add missing indexes for better performance
DO $$
BEGIN
    -- Check if index exists on profiles.username
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' AND indexname = 'profiles_username_idx'
    ) THEN
        CREATE INDEX profiles_username_idx ON profiles(username);
    END IF;

    -- Check if index exists on profiles.email
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' AND indexname = 'profiles_email_idx'
    ) THEN
        CREATE INDEX profiles_email_idx ON profiles(email);
    END IF;

    -- Check if index exists on task_submissions.task_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'task_submissions' AND indexname = 'task_submissions_task_id_idx'
    ) THEN
        CREATE INDEX task_submissions_task_id_idx ON task_submissions(task_id);
    END IF;

    -- Check if index exists on task_submissions.user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'task_submissions' AND indexname = 'task_submissions_user_id_idx'
    ) THEN
        CREATE INDEX task_submissions_user_id_idx ON task_submissions(user_id);
    END IF;

    -- Check if index exists on forum_posts.category_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'forum_posts' AND indexname = 'forum_posts_category_id_idx'
    ) THEN
        CREATE INDEX forum_posts_category_id_idx ON forum_posts(category_id);
    END IF;

    -- Check if index exists on forum_posts.user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'forum_posts' AND indexname = 'forum_posts_user_id_idx'
    ) THEN
        CREATE INDEX forum_posts_user_id_idx ON forum_posts(user_id);
    END IF;

    -- Check if index exists on forum_comments.post_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'forum_comments' AND indexname = 'forum_comments_post_id_idx'
    ) THEN
        CREATE INDEX forum_comments_post_id_idx ON forum_comments(post_id);
    END IF;

    -- Check if index exists on forum_comments.user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'forum_comments' AND indexname = 'forum_comments_user_id_idx'
    ) THEN
        CREATE INDEX forum_comments_user_id_idx ON forum_comments(user_id);
    END IF;

    -- Check if index exists on modules.course_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'modules' AND indexname = 'modules_course_id_idx'
    ) THEN
        CREATE INDEX modules_course_id_idx ON modules(course_id);
    END IF;

    -- Check if index exists on lessons.module_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'lessons' AND indexname = 'lessons_module_id_idx'
    ) THEN
        CREATE INDEX lessons_module_id_idx ON lessons(module_id);
    END IF;
END
$$;

-- Fix schema inconsistencies
DO $$
BEGIN
    -- Check if tasks table has supported_languages column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'supported_languages'
    ) THEN
        -- Add supported_languages column if it doesn't exist
        ALTER TABLE tasks ADD COLUMN supported_languages TEXT[] DEFAULT '{}';
        
        -- Copy data from languages to supported_languages
        UPDATE tasks SET supported_languages = languages;
    END IF;

    -- Check if test_cases table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_cases'
    ) THEN
        -- Create test_cases table
        CREATE TABLE test_cases (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            input TEXT NOT NULL,
            expected_output TEXT NOT NULL,
            is_hidden BOOLEAN DEFAULT false,
            explanation TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Set up Row Level Security (RLS)
        ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

        -- Create policies for test_cases
        -- Test cases are viewable by everyone
        CREATE POLICY "Test cases are viewable by everyone"
            ON test_cases FOR SELECT
            USING (true);

        -- Only admins can insert, update, or delete test cases
        CREATE POLICY "Only admins can insert test cases"
            ON test_cases FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE username = 'admin'
            ));

        CREATE POLICY "Only admins can update test cases"
            ON test_cases FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE username = 'admin'
            ));

        CREATE POLICY "Only admins can delete test cases"
            ON test_cases FOR DELETE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE username = 'admin'
            ));

        -- Create index on task_id
        CREATE INDEX test_cases_task_id_idx ON test_cases(task_id);

        -- Migrate test cases from JSONB to table
        -- This is a complex operation that requires parsing JSON
        -- We'll use a PL/pgSQL function to do this
        CREATE OR REPLACE FUNCTION migrate_test_cases()
        RETURNS void AS $$
        DECLARE
            task_record RECORD;
            test_case_json JSONB;
            test_case_array JSONB;
            i INTEGER;
        BEGIN
            FOR task_record IN SELECT id, test_cases FROM tasks WHERE test_cases IS NOT NULL AND test_cases != '[]'::jsonb LOOP
                test_case_array := task_record.test_cases;
                
                FOR i IN 0..jsonb_array_length(test_case_array) - 1 LOOP
                    test_case_json := test_case_array->i;
                    
                    INSERT INTO test_cases (
                        task_id,
                        input,
                        expected_output,
                        is_hidden,
                        explanation
                    ) VALUES (
                        task_record.id,
                        test_case_json->>'input',
                        test_case_json->>'expected_output',
                        COALESCE((test_case_json->>'is_hidden')::boolean, false),
                        test_case_json->>'explanation'
                    );
                END LOOP;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;

        -- Execute the migration function
        SELECT migrate_test_cases();
        
        -- Drop the migration function
        DROP FUNCTION migrate_test_cases();
    END IF;
END
$$;

-- Add database functions for common operations
DO $$
BEGIN
    -- Function to get user profile with stats
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_user_profile_with_stats'
    ) THEN
        CREATE OR REPLACE FUNCTION get_user_profile_with_stats(user_id UUID)
        RETURNS TABLE (
            id UUID,
            username TEXT,
            email TEXT,
            full_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            website TEXT,
            social_links JSONB,
            skills TEXT[],
            experience_level TEXT,
            completed_tasks INTEGER,
            points INTEGER,
            badges TEXT[],
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE,
            task_count BIGINT,
            forum_post_count BIGINT,
            forum_comment_count BIGINT
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM task_submissions ts WHERE ts.user_id = p.id AND ts.status = 'success') AS task_count,
                (SELECT COUNT(*) FROM forum_posts fp WHERE fp.user_id = p.id) AS forum_post_count,
                (SELECT COUNT(*) FROM forum_comments fc WHERE fc.user_id = p.id) AS forum_comment_count
            FROM 
                profiles p
            WHERE 
                p.id = user_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;

    -- Function to get task with test cases
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_task_with_test_cases'
    ) THEN
        CREATE OR REPLACE FUNCTION get_task_with_test_cases(task_id UUID)
        RETURNS TABLE (
            id UUID,
            title TEXT,
            description TEXT,
            difficulty TEXT,
            category TEXT[],
            languages TEXT[],
            supported_languages TEXT[],
            initial_code JSONB,
            solution JSONB,
            hints TEXT[],
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE,
            test_cases JSONB
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                t.id,
                t.title,
                t.description,
                t.difficulty,
                t.category,
                t.languages,
                t.supported_languages,
                t.initial_code,
                t.solution,
                t.hints,
                t.created_at,
                t.updated_at,
                COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', tc.id,
                                'input', tc.input,
                                'expected_output', tc.expected_output,
                                'is_hidden', tc.is_hidden,
                                'explanation', tc.explanation
                            )
                        )
                        FROM test_cases tc
                        WHERE tc.task_id = t.id
                    ),
                    '[]'::jsonb
                ) AS test_cases
            FROM 
                tasks t
            WHERE 
                t.id = task_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;

    -- Function to get leaderboard
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_leaderboard'
    ) THEN
        CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
        RETURNS TABLE (
            id UUID,
            username TEXT,
            full_name TEXT,
            avatar_url TEXT,
            points INTEGER,
            completed_tasks INTEGER,
            badges TEXT[]
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                p.id,
                p.username,
                p.full_name,
                p.avatar_url,
                p.points,
                p.completed_tasks,
                p.badges
            FROM 
                profiles p
            ORDER BY 
                p.points DESC, p.completed_tasks DESC
            LIMIT limit_count;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END
$$;

-- Add database triggers for data consistency
DO $$
BEGIN
    -- Trigger to update user points when a task is completed successfully
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_points_on_task_completion'
    ) THEN
        CREATE OR REPLACE FUNCTION update_user_points_on_task_completion()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Only update points for successful submissions
            IF NEW.status = 'success' THEN
                -- Check if this is the first successful submission for this task
                IF NOT EXISTS (
                    SELECT 1 FROM task_submissions
                    WHERE task_id = NEW.task_id
                    AND user_id = NEW.user_id
                    AND status = 'success'
                    AND id != NEW.id
                ) THEN
                    -- Update user points based on task difficulty
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
                        ),
                        -- Update user level based on points
                        experience_level = (
                            CASE 
                                WHEN (points + (
                                    CASE 
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'easy' THEN 10
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'medium' THEN 20
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'hard' THEN 30
                                        ELSE 0
                                    END
                                )) < 100 THEN 'beginner'
                                WHEN (points + (
                                    CASE 
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'easy' THEN 10
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'medium' THEN 20
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'hard' THEN 30
                                        ELSE 0
                                    END
                                )) < 300 THEN 'intermediate'
                                WHEN (points + (
                                    CASE 
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'easy' THEN 10
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'medium' THEN 20
                                        WHEN (SELECT difficulty FROM tasks WHERE id = NEW.task_id) = 'hard' THEN 30
                                        ELSE 0
                                    END
                                )) < 600 THEN 'advanced'
                                ELSE 'expert'
                            END
                        )
                    WHERE id = NEW.user_id;
                END IF;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER update_user_points_on_task_completion
        AFTER INSERT ON task_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_user_points_on_task_completion();
    END IF;

    -- Trigger to update forum post count in categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_category_post_count'
    ) THEN
        CREATE OR REPLACE FUNCTION update_category_post_count()
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

        CREATE TRIGGER update_category_post_count
        AFTER INSERT OR DELETE ON forum_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_category_post_count();
    END IF;

    -- Trigger to update comment count in posts
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_post_comment_count'
    ) THEN
        CREATE OR REPLACE FUNCTION update_post_comment_count()
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

        CREATE TRIGGER update_post_comment_count
        AFTER INSERT OR DELETE ON forum_comments
        FOR EACH ROW
        EXECUTE FUNCTION update_post_comment_count();
    END IF;

    -- Trigger to update lesson count in modules
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_module_lesson_count'
    ) THEN
        CREATE OR REPLACE FUNCTION update_module_lesson_count()
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

        CREATE TRIGGER update_module_lesson_count
        AFTER INSERT OR DELETE ON lessons
        FOR EACH ROW
        EXECUTE FUNCTION update_module_lesson_count();
    END IF;

    -- Trigger to update module count in courses
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_course_module_count'
    ) THEN
        CREATE OR REPLACE FUNCTION update_course_module_count()
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

        CREATE TRIGGER update_course_module_count
        AFTER INSERT OR DELETE ON modules
        FOR EACH ROW
        EXECUTE FUNCTION update_course_module_count();
    END IF;
END
$$;
