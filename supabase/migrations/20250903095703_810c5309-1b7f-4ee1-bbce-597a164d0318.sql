-- La politique actuelle ne permet pas à l'utilisateur de voir ses propres rôles
-- Corrigeons cela
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Nouvelle politique simplifiée qui fonctionne
CREATE POLICY "Users can view their own roles - fixed"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);