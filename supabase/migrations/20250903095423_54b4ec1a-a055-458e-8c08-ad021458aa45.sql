-- Fix the other policies that might use the recursive has_role function
-- First, let's check and fix property policies
DROP POLICY IF EXISTS "Super admins can delete any property" ON public.properties;
DROP POLICY IF EXISTS "Super admins can update any property validation" ON public.properties;

-- Create non-recursive policies for properties
CREATE POLICY "Super admins can delete any property - no recursion"
ON public.properties
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update any property - no recursion"
ON public.properties
FOR UPDATE
USING (
  (auth.uid() = host_id) OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);