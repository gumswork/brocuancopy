-- Create enum for element types
CREATE TYPE public.element_type AS ENUM ('heading', 'paragraph', 'button', 'card', 'video', 'card_group');

-- Create homepage_sections table
CREATE TABLE public.homepage_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    background TEXT NOT NULL DEFAULT 'default',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homepage_elements table
CREATE TABLE public.homepage_elements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
    type public.element_type NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_elements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_sections
CREATE POLICY "Anyone can view visible sections"
ON public.homepage_sections
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can view all sections"
ON public.homepage_sections
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sections"
ON public.homepage_sections
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sections"
ON public.homepage_sections
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sections"
ON public.homepage_sections
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for homepage_elements
CREATE POLICY "Anyone can view visible elements"
ON public.homepage_elements
FOR SELECT
USING (
    is_visible = true AND
    EXISTS (
        SELECT 1 FROM public.homepage_sections
        WHERE id = homepage_elements.section_id AND is_visible = true
    )
);

CREATE POLICY "Admins can view all elements"
ON public.homepage_elements
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert elements"
ON public.homepage_elements
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update elements"
ON public.homepage_elements
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete elements"
ON public.homepage_elements
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_homepage_sections_order ON public.homepage_sections(order_index);
CREATE INDEX idx_homepage_elements_section ON public.homepage_elements(section_id);
CREATE INDEX idx_homepage_elements_order ON public.homepage_elements(order_index);

-- Create triggers for updated_at
CREATE TRIGGER update_homepage_sections_updated_at
    BEFORE UPDATE ON public.homepage_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_elements_updated_at
    BEFORE UPDATE ON public.homepage_elements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();