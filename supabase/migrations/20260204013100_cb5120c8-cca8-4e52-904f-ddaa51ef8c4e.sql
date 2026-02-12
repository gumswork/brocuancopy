-- Create enum for course access levels
CREATE TYPE public.course_access_level AS ENUM ('public', 'basic', 'pro');

-- Add access_level column to courses table
ALTER TABLE public.courses 
ADD COLUMN access_level public.course_access_level NOT NULL DEFAULT 'pro';