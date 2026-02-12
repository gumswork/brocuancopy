-- Add unique constraint on email for upsert to work properly
ALTER TABLE public.buyers ADD CONSTRAINT buyers_email_key UNIQUE (email);