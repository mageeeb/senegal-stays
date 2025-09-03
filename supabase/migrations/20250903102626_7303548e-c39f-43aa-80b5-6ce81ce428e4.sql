-- Ajouter une colonne pour stocker la raison du rejet
ALTER TABLE public.properties 
ADD COLUMN rejection_reason text;