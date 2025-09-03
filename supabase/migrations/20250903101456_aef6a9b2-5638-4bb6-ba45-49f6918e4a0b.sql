-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Super admin can view all properties" ON properties;
DROP POLICY IF EXISTS "Super admin can update all properties" ON properties;
DROP POLICY IF EXISTS "Super admin can delete all properties" ON properties;

-- Créer une fonction SECURITY DEFINER pour vérifier si l'utilisateur est super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'nanouchkaly@yahoo.fr'
  );
$$;

-- Créer de nouvelles politiques utilisant la fonction sécurisée
CREATE POLICY "Super admin can view all properties" 
ON properties 
FOR SELECT 
USING (
  public.is_super_admin() = true
  OR auth.uid() = host_id 
  OR is_active = true
);

CREATE POLICY "Super admin can update all properties" 
ON properties 
FOR UPDATE 
USING (
  public.is_super_admin() = true
  OR auth.uid() = host_id
);

CREATE POLICY "Super admin can delete all properties" 
ON properties 
FOR DELETE 
USING (
  public.is_super_admin() = true
  OR auth.uid() = host_id
);