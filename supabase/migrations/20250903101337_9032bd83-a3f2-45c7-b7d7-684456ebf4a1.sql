-- Supprimer les anciennes politiques qui causent des problèmes d'accès à auth.users
DROP POLICY IF EXISTS "Super admins can update any property - no recursion" ON properties;
DROP POLICY IF EXISTS "Super admins can delete any property - no recursion" ON properties;

-- Créer de nouvelles politiques pour le super admin basées sur l'email
CREATE POLICY "Super admin can view all properties" 
ON properties 
FOR SELECT 
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanouchkaly@yahoo.fr' 
  OR auth.uid() = host_id 
  OR is_active = true
);

CREATE POLICY "Super admin can update all properties" 
ON properties 
FOR UPDATE 
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanouchkaly@yahoo.fr' 
  OR auth.uid() = host_id
);

CREATE POLICY "Super admin can delete all properties" 
ON properties 
FOR DELETE 
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'nanouchkaly@yahoo.fr' 
  OR auth.uid() = host_id
);