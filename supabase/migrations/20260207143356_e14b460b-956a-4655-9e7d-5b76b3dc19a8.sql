-- Add link fields to announcements table
ALTER TABLE public.announcements 
ADD COLUMN link_url TEXT,
ADD COLUMN link_text TEXT;

-- Create table to track read announcements per member
CREATE TABLE public.announcement_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, buyer_email)
);

-- Enable RLS
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- RLS policies for announcement_reads
CREATE POLICY "Users can view their own read status"
ON public.announcement_reads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.buyers 
    WHERE buyers.email = announcement_reads.buyer_email
  )
);

CREATE POLICY "Users can mark announcements as read"
ON public.announcement_reads FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.buyers 
    WHERE buyers.email = announcement_reads.buyer_email
  )
);

CREATE POLICY "Admins can view all read status"
ON public.announcement_reads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for performance
CREATE INDEX idx_announcement_reads_email ON public.announcement_reads(buyer_email);
CREATE INDEX idx_announcement_reads_announcement ON public.announcement_reads(announcement_id);