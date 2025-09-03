-- Supprimer toutes les politiques problématiques
DROP POLICY IF EXISTS "Super admin can view all properties" ON properties;
DROP POLICY IF EXISTS "Super admin can update all properties" ON properties;
DROP POLICY IF EXISTS "Super admin can delete all properties" ON properties;

-- Créer des politiques simples basées sur l'UID du super admin (nanouchkaly@yahoo.fr)
-- L'UID de cet utilisateur est b46107f1-c089-47fa-98ac-71a950a82658 d'après les logs
CREATE POLICY "Super admin can view all properties by UID" 
ON properties 
FOR SELECT 
USING (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
  OR auth.uid() = host_id 
  OR is_active = true
);

CREATE POLICY "Super admin can update all properties by UID" 
ON properties 
FOR UPDATE 
USING (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
  OR auth.uid() = host_id
);

CREATE POLICY "Super admin can delete all properties by UID" 
ON properties 
FOR DELETE 
USING (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
  OR auth.uid() = host_id
);

-- Supprimer la fonction qui n'est plus nécessaire
DROP FUNCTION IF EXISTS public.is_super_admin();