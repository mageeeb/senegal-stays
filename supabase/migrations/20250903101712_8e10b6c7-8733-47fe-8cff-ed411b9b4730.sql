-- Corriger les politiques sur validation_criteria pour éviter l'accès à auth.users
DROP POLICY IF EXISTS "Super admins can manage validation criteria - no recursion" ON validation_criteria;

-- Créer une politique simple pour le super admin basée sur l'UID
CREATE POLICY "Super admin can manage validation criteria by UID" 
ON validation_criteria 
FOR ALL 
USING (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
)
WITH CHECK (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
);

-- Corriger aussi les politiques sur property_evaluations
DROP POLICY IF EXISTS "Super admins can manage evaluations - no recursion" ON property_evaluations;

CREATE POLICY "Super admin can manage evaluations by UID" 
ON property_evaluations 
FOR ALL 
USING (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
)
WITH CHECK (
  auth.uid() = 'b46107f1-c089-47fa-98ac-71a950a82658'::uuid
);