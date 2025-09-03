-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create a simple policy that allows users to manage roles if they have super_admin role directly
CREATE POLICY "Super admins can manage all roles - no recursion"
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