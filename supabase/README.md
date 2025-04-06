# KodeLab Supabase Setup

This directory contains the SQL migrations for setting up the Supabase database schema for KodeLab.

## Database Schema

The database schema consists of the following tables:

1. **Profiles**
   - User profiles with additional information
   - Created automatically when a new user signs up

2. **Tasks**
   - Coding challenges
   - Task submissions from users

3. **Forum**
   - Categories, posts, and comments
   - Likes and solutions

4. **Curriculum**
   - Courses, modules, and lessons
   - User progress tracking

## How to Apply Migrations

### Option 1: Using the Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

### Option 2: Using the Supabase Dashboard

1. Go to the Supabase Dashboard and select your project
2. Navigate to the SQL Editor
3. Copy and paste each migration file in order:
   - 01_profiles.sql
   - 02_tasks.sql
   - 03_forum.sql
   - 04_curriculum.sql
4. Execute each script

## Row Level Security (RLS)

All tables have Row Level Security (RLS) enabled with appropriate policies:

- Public data is viewable by everyone
- Users can only modify their own data
- Admin users have additional privileges

## Functions and Triggers

The schema includes several functions and triggers to:

- Automatically create user profiles when users sign up
- Update counters (post count, comment count, etc.)
- Update user statistics when they complete tasks
- Track user progress through the curriculum

## Initial Data

After applying the migrations, you may want to seed the database with initial data:

1. Create an admin user
2. Add some initial categories for the forum
3. Add some initial tasks
4. Add some initial courses and modules

## Troubleshooting

If you encounter any issues:

1. Check the Supabase logs for error messages
2. Ensure you have the necessary permissions
3. Verify that the migrations are applied in the correct order
