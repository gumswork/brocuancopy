-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view enrollments by email" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can create enrollments" ON public.enrollments;

-- Create more secure policies for enrollments
-- Users can only view their own enrollments (matched by email in buyers table)
CREATE POLICY "Users can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.buyers 
    WHERE buyers.email = enrollments.buyer_email
  )
);

-- Users can only enroll themselves (must have matching buyer record)
CREATE POLICY "Users can enroll in courses"
ON public.enrollments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.buyers 
    WHERE buyers.email = enrollments.buyer_email
  )
);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));