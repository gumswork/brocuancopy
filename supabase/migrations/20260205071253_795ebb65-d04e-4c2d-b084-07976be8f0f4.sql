-- Add RLS policies for admin to manage buyers
CREATE POLICY "Admins can view all buyers" 
ON public.buyers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert buyers" 
ON public.buyers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update buyers" 
ON public.buyers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete buyers" 
ON public.buyers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));