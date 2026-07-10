-- ==========================================
-- SQL SCHEMA FOR BERDON INFORMATION CENTER
-- ==========================================
-- Run this script in your Supabase SQL Editor to set up the database.
-- Target Database: Supabase PostgreSQL
-- Created: 2026-07-10

-- 1. Create the contents table
CREATE TABLE IF NOT EXISTS public.contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('artikel', 'materi', 'berita', 'arsip', 'info_komunitas')),
    image_url TEXT,
    likes INTEGER DEFAULT 0 NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- 3. Create public security policies
-- Policy: Allow anyone (anon & authenticated) to read contents
CREATE POLICY "Allow public read access" ON public.contents
    FOR SELECT TO public USING (true);

-- Policy: Allow public updates to increment likes and views, or edit as admin
CREATE POLICY "Allow public update access" ON public.contents
    FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Policy: Allow public inserts (admin uploads new content client-side)
CREATE POLICY "Allow public insert access" ON public.contents
    FOR INSERT TO public WITH CHECK (true);

-- Policy: Allow public deletes (admin removes content client-side)
CREATE POLICY "Allow public delete access" ON public.contents
    FOR DELETE TO public USING (true);


-- ==========================================
-- SUPABASE STORAGE BUCKET SETUP
-- ==========================================
-- For upload storage to work, you must create a public bucket named "berdon-assets":
-- 1. Go to the "Storage" tab in your Supabase Dashboard.
-- 2. Click "New bucket".
-- 3. Name it "berdon-assets".
-- 4. Toggle the "Public bucket" switch to ON (so images are publicly viewable).
-- 5. Click "Save".
-- 6. Go to "Policies" in Storage, and ensure "Allowed to Upload/Delete/Update" is enabled for anon/public users
--    or simply set public policies so anyone can upload images to this bucket.
--    The SQL to create storage policies is below (runs automatically inside Supabase storage schema):

/*
-- Execute these in your Supabase SQL Editor if you face upload issues:
CREATE POLICY "Allow public upload" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'berdon-assets');

CREATE POLICY "Allow public select" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'berdon-assets');

CREATE POLICY "Allow public update" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'berdon-assets');

CREATE POLICY "Allow public delete" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'berdon-assets');
*/
