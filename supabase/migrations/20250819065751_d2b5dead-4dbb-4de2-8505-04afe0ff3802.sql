-- Supprimer toutes les politiques existantes pour vehicles
DROP POLICY IF EXISTS "Anyone can view available vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicle owners can manage their vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.vehicles;

-- Créer des politiques RLS correctes pour la table vehicles
CREATE POLICY "Anyone can view available vehicles" 
ON public.vehicles 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Users can insert their own vehicles" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vehicle owners can update their vehicles" 
ON public.vehicles 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Vehicle owners can delete their vehicles" 
ON public.vehicles 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Permettre aux propriétaires de voir leurs propres véhicules (même si pas disponibles)
CREATE POLICY "Vehicle owners can view their own vehicles" 
ON public.vehicles 
FOR SELECT 
USING (auth.uid() = owner_id);