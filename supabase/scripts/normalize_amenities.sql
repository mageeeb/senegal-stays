-- Script ad hoc de normalisation des équipements dans la table properties
-- Objectif: trim, remplacer variantes par canonique, supprimer doublons
-- Variantes couvertes: "Petit déjeuner", "Petit-déjeuner", "Breakfast" -> "Petit déjeuner"

-- 1) Fonction utilitaire pour normaliser un libellé
CREATE OR REPLACE FUNCTION public.normalize_amenity_label(input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  raw text := COALESCE(input, '');
  cleaned text;
  key text;
BEGIN
  cleaned := btrim(regexp_replace(raw, '\\s+', ' ', 'g'));
  IF cleaned = '' THEN
    RETURN '';
  END IF;

  -- Clé de comparaison simple: minuscules, accents retirés, tirets normalisés
  key := lower(cleaned);
  key := translate(key, '̧́̀̂̈̃', ''); -- strip some common accents (NFD fallback may not be available)
  key := replace(key, '‐', '-');
  key := replace(key, '‑', '-');
  key := replace(key, '‒', '-');
  key := replace(key, '–', '-');
  key := replace(key, '—', '-');
  key := replace(key, '―', '-');

  -- Mapping des synonymes
  IF key IN ('petit dejeuner','petit-déjeuner','petit-dejeuner','breakfast') THEN
    RETURN 'Petit déjeuner';
  END IF;

  -- Retourner cleaned pour conserver les valeurs inconnues (harmonisées visuellement)
  RETURN cleaned;
END;
$$;

-- 2) Mise à jour des lignes existantes
-- On déplie l'array, on normalise chaque item, on filtre les vides, on dédoublonne, puis on regroupe
UPDATE public.properties p
SET amenities = sub.amenities
FROM (
  SELECT id,
         (SELECT ARRAY(
            SELECT DISTINCT a
            FROM (
              SELECT normalize_amenity_label(amenity) AS a
              FROM unnest(COALESCE(p.amenities, ARRAY[]::text[])) amenity
            ) t
            WHERE a IS NOT NULL AND a <> ''
            ORDER BY a
         )) AS amenities
  FROM public.properties p
) AS sub
WHERE sub.id = p.id;

-- 3) Vérification rapide (optionnel):
-- SELECT id, amenities FROM public.properties WHERE amenities @> ARRAY['Petit déjeuner'];
