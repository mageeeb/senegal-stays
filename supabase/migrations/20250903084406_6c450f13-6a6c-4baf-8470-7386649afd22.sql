-- Créer une fonction pour gérer les nouveaux utilisateurs automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger pour automatiquement créer un profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Supprimer temporairement la contrainte de clé étrangère sur reviews.reviewer_id
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;

-- Supprimer temporairement la contrainte de clé étrangère sur bookings.guest_id  
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_guest_id_fkey;

-- Insérer des profils factices
INSERT INTO public.profiles (user_id, first_name, last_name, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Marie', 'Diallo', 'marie.diallo@email.com'),
('33333333-3333-3333-3333-333333333333', 'Amadou', 'Ba', 'amadou.ba@email.com'),
('55555555-5555-5555-5555-555555555555', 'Fatou', 'Sall', 'fatou.sall@email.com'),
('77777777-7777-7777-7777-777777777777', 'Ibrahim', 'Ndiaye', 'ibrahim.ndiaye@email.com'),
('99999999-9999-9999-9999-999999999999', 'Aissatou', 'Fall', 'aissatou.fall@email.com')
ON CONFLICT (user_id) DO NOTHING;

-- Insérer des réservations de test (status completed pour permettre les avis)
INSERT INTO public.bookings (id, property_id, guest_id, check_in, check_out, total_price, guests_count, status, created_at) VALUES 
('22222222-2222-2222-2222-222222222222', '483a5c2a-1da3-4a28-b5ac-593eac48066b', '11111111-1111-1111-1111-111111111111', '2024-02-10', '2024-02-14', 200000, 2, 'completed', '2024-02-01T10:00:00Z'),
('44444444-4444-4444-4444-444444444444', '483a5c2a-1da3-4a28-b5ac-593eac48066b', '33333333-3333-3333-3333-333333333333', '2024-02-05', '2024-02-09', 160000, 3, 'completed', '2024-01-25T15:00:00Z'),
('66666666-6666-6666-6666-666666666666', '483a5c2a-1da3-4a28-b5ac-593eac48066b', '55555555-5555-5555-5555-555555555555', '2024-01-30', '2024-02-04', 200000, 2, 'completed', '2024-01-20T12:00:00Z'),
('88888888-8888-8888-8888-888888888888', '483a5c2a-1da3-4a28-b5ac-593eac48066b', '77777777-7777-7777-7777-777777777777', '2024-01-25', '2024-01-27', 80000, 1, 'completed', '2024-01-15T09:00:00Z'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '483a5c2a-1da3-4a28-b5ac-593eac48066b', '99999999-9999-9999-9999-999999999999', '2024-01-15', '2024-01-19', 160000, 4, 'completed', '2024-01-05T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques avis de test pour la propriété courante
INSERT INTO public.reviews (property_id, reviewer_id, booking_id, rating, comment, created_at) VALUES 
-- Avis 1
('483a5c2a-1da3-4a28-b5ac-593eac48066b', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 5, 'Séjour absolument parfait ! Le logement était impeccable, très bien situé et l''hôte très accueillant. Je recommande vivement !', '2024-02-15T10:30:00Z'),
-- Avis 2  
('483a5c2a-1da3-4a28-b5ac-593eac48066b', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 4, 'Très bon logement, propre et bien équipé. La localisation est idéale pour visiter la région. Petit bémol sur le wifi qui était un peu lent.', '2024-02-10T14:20:00Z'),
-- Avis 3
('483a5c2a-1da3-4a28-b5ac-593eac48066b', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 5, 'Magnifique appartement avec une vue splendide ! Tout était parfait, de l''accueil aux équipements. Merci pour ce super séjour.', '2024-02-05T09:15:00Z'),
-- Avis 4
('483a5c2a-1da3-4a28-b5ac-593eac48066b', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 4, 'Logement conforme aux photos, très fonctionnel. L''hôte est réactif et de bon conseil pour découvrir la ville.', '2024-01-28T16:45:00Z'),
-- Avis 5
('483a5c2a-1da3-4a28-b5ac-593eac48066b', '99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Séjour de rêve ! Le logement est encore plus beau qu''en photos. Emplacement parfait, propreté irréprochable. À refaire !', '2024-01-20T11:00:00Z');