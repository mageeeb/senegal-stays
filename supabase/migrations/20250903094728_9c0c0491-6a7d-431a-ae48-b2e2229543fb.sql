-- Assign super admin role to existing user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'nanouchkaly@yahoo.fr'
ON CONFLICT (user_id, role) DO NOTHING;