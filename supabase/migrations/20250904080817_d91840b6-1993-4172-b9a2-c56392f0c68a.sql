-- Fix RLS policy for user_roles to avoid auth.users permission issues
DROP POLICY IF EXISTS "Super admin email can manage all roles" ON public.user_roles;

-- Create a simpler policy using the direct user_id check
CREATE POLICY "Super admin can manage all roles" 
ON public.user_roles 
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

-- Remove duplicate SELECT policies (keep only one)
DROP POLICY IF EXISTS "Users can view their own roles - simple" ON public.user_roles;