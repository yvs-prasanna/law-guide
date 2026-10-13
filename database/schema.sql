-- ==========================================================
-- Legal Case Finder AI - Supabase Database Schema
-- Run this script in the Supabase SQL Editor.
-- ==========================================================

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. Table: legal_searches
-- Stores historical AI legal queries and structured results
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_description TEXT NOT NULL,
    category TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    additional_facts TEXT,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_searches_user_id ON public.legal_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_searches_created_at ON public.legal_searches(created_at DESC);

-- ----------------------------------------------------------
-- 2. Table: saved_cases
-- Stores court judgments and legal precedents bookmarked by users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    case_title TEXT NOT NULL,
    court TEXT,
    citation TEXT,
    source_url TEXT,
    case_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_cases_user_id ON public.saved_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cases_created_at ON public.saved_cases(created_at DESC);

-- ----------------------------------------------------------
-- Row Level Security (RLS) Setup
-- ----------------------------------------------------------

-- Enable RLS on legal_searches
ALTER TABLE public.legal_searches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent execution)
DROP POLICY IF EXISTS "Users can read own searches" ON public.legal_searches;
DROP POLICY IF EXISTS "Users can insert own searches" ON public.legal_searches;
DROP POLICY IF EXISTS "Users can delete own searches" ON public.legal_searches;

-- Policies for legal_searches
CREATE POLICY "Users can read own searches" 
    ON public.legal_searches
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches" 
    ON public.legal_searches
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own searches" 
    ON public.legal_searches
    FOR DELETE 
    USING (auth.uid() = user_id);


-- Enable RLS on saved_cases
ALTER TABLE public.saved_cases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent execution)
DROP POLICY IF EXISTS "Users can read own saved cases" ON public.saved_cases;
DROP POLICY IF EXISTS "Users can insert own saved cases" ON public.saved_cases;
DROP POLICY IF EXISTS "Users can delete own saved cases" ON public.saved_cases;

-- Policies for saved_cases
CREATE POLICY "Users can read own saved cases" 
    ON public.saved_cases
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved cases" 
    ON public.saved_cases
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved cases" 
    ON public.saved_cases
    FOR DELETE 
    USING (auth.uid() = user_id);
