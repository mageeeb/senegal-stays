-- Fix the remaining policies with recursion issues
DROP POLICY IF EXISTS "Super admins can manage validation criteria" ON public.validation_criteria;
DROP POLICY IF EXISTS "Super admins can manage evaluations" ON public.property_evaluations;

-- Create non-recursive policies for validation_criteria  
CREATE POLICY "Super admins can manage validation criteria - no recursion"
ON public.validation_criteria
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Create non-recursive policies for property_evaluations
CREATE POLICY "Super admins can manage evaluations - no recursion"
ON public.property_evaluations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);