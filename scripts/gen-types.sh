#!/bin/bash
# Script to generate Supabase types

# Try to get project ID from .env if it exists (assuming a variable name like VITE_SUPABASE_PROJECT_ID)
# Otherwise, user can pass it as first argument
PROJECT_ID=${1:-$VITE_SUPABASE_PROJECT_ID}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No Supabase Project ID provided."
  echo "Usage: ./scripts/gen-types.sh <project-id>"
  exit 1
fi

echo "Generating types for project $PROJECT_ID..."
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/types/supabase.ts
echo "Types generated successfully in src/types/supabase.ts"
