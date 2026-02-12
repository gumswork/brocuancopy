-- Create enum for access types
CREATE TYPE public.access_type AS ENUM ('basic', 'pro', 'ebook', 'mindcare');

-- Create buyers table
CREATE TABLE public.buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    product_title TEXT NOT NULL,
    access_type access_type NOT NULL DEFAULT 'basic',
    ref_id TEXT,
    amount TEXT,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE UNIQUE INDEX idx_buyers_email_product ON public.buyers(email, product_title);
CREATE INDEX idx_buyers_email ON public.buyers(email);
CREATE INDEX idx_buyers_access_type ON public.buyers(access_type);

-- Enable RLS
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check emails (for login verification)
CREATE POLICY "Anyone can check their email" 
ON public.buyers 
FOR SELECT 
USING (true);

-- Note: No INSERT/UPDATE/DELETE policies = only service role can write

-- Add trigger for updated_at
CREATE TRIGGER update_buyers_updated_at
    BEFORE UPDATE ON public.buyers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();