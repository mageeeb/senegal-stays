-- Supprimons complètement les politiques récursives
DROP POLICY IF EXISTS "Super admins can manage all roles - no recursion" ON public.user_roles;

-- Politique simple : tout utilisateur peut voir SES rôles, et l'email spécifique peut tout faire
CREATE POLICY "Users can view their own roles - simple"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Politique spéciale pour l'email super admin sans recursion
CREATE POLICY "Super admin email can manage all roles"
ON public.user_roles
FOR ALL
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanouchkaly@yahoo.fr'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanouchkaly@yahoo.fr'
);