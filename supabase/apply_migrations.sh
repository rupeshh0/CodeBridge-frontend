#!/bin/bash

# This script applies all migrations to Supabase

# Set your Supabase URL and key
SUPABASE_URL="https://tpgqvaeyfpalxbxpfrcm.supabase.co"
SUPABASE_KEY="your-supabase-key"  # Replace with your actual key

# Apply migrations in order
echo "Applying migrations..."

echo "1. Applying profiles migration..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc/pgapply" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d @migrations/01_profiles.sql

echo "2. Applying tasks migration..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc/pgapply" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d @migrations/02_tasks.sql

echo "3. Applying forum migration..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc/pgapply" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d @migrations/03_forum.sql

echo "4. Applying curriculum migration..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc/pgapply" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d @migrations/04_curriculum.sql

echo "5. Applying seed data..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc/pgapply" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d @seed.sql

echo "All migrations applied successfully!"
