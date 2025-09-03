-- Insérer des avis de test pour la propriété actuellement consultée
INSERT INTO public.reviews (property_id, reviewer_id, booking_id, rating, comment, created_at) VALUES 
('1e19868e-2903-4cb3-a549-16dd6bb6a02d', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 5, 'Studio parfait pour un séjour à Saint-Louis ! Très bien situé dans le quartier de Ndiolofène, propre et bien équipé. Je recommande vivement !', '2024-12-15T10:30:00Z'),
('1e19868e-2903-4cb3-a549-16dd6bb6a02d', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 4, 'Excellent rapport qualité-prix ! Le studio est fonctionnel et bien situé. L''hôte est très accueillant et de bon conseil.', '2024-12-10T14:20:00Z'),
('1e19868e-2903-4cb3-a549-16dd6bb6a02d', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 5, 'Séjour parfait ! Le studio est exactement comme sur les photos, très propre et bien équipé. Emplacement idéal pour découvrir Saint-Louis.', '2024-12-05T09:15:00Z'),
('1e19868e-2903-4cb3-a549-16dd6bb6a02d', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 4, 'Très bon studio, bien situé et confortable. La climatisation fonctionne parfaitement, idéal pour les chaudes journées.', '2024-11-28T16:45:00Z');

-- Insérer des réservations de test pour cette propriété
INSERT INTO public.bookings (id, property_id, guest_id, check_in, check_out, total_price, guests_count, status, created_at) VALUES 
('11111111-2222-3333-4444-555555555555', '1e19868e-2903-4cb3-a549-16dd6bb6a02d', '11111111-1111-1111-1111-111111111111', '2024-12-10', '2024-12-14', 120000, 2, 'completed', '2024-12-01T10:00:00Z'),
('22222222-3333-4444-5555-666666666666', '1e19868e-2903-4cb3-a549-16dd6bb6a02d', '33333333-3333-3333-3333-333333333333', '2024-12-05', '2024-12-09', 120000, 1, 'completed', '2024-11-25T15:00:00Z'),
('33333333-4444-5555-6666-777777777777', '1e19868e-2903-4cb3-a549-16dd6bb6a02d', '55555555-5555-5555-5555-555555555555', '2024-11-30', '2024-12-04', 150000, 2, 'completed', '2024-11-20T12:00:00Z'),
('44444444-5555-6666-7777-888888888888', '1e19868e-2903-4cb3-a549-16dd6bb6a02d', '77777777-7777-7777-7777-777777777777', '2024-11-25', '2024-11-27', 60000, 1, 'completed', '2024-11-15T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Mettre à jour les IDs de booking dans les avis pour correspondre aux nouvelles réservations
UPDATE public.reviews 
SET booking_id = CASE 
    WHEN reviewer_id = '11111111-1111-1111-1111-111111111111' AND property_id = '1e19868e-2903-4cb3-a549-16dd6bb6a02d' THEN '11111111-2222-3333-4444-555555555555'
    WHEN reviewer_id = '33333333-3333-3333-3333-333333333333' AND property_id = '1e19868e-2903-4cb3-a549-16dd6bb6a02d' THEN '22222222-3333-4444-5555-666666666666'
    WHEN reviewer_id = '55555555-5555-5555-5555-555555555555' AND property_id = '1e19868e-2903-4cb3-a549-16dd6bb6a02d' THEN '33333333-4444-5555-6666-777777777777'
    WHEN reviewer_id = '77777777-7777-7777-7777-777777777777' AND property_id = '1e19868e-2903-4cb3-a549-16dd6bb6a02d' THEN '44444444-5555-6666-7777-888888888888'
    ELSE booking_id
END
WHERE property_id = '1e19868e-2903-4cb3-a549-16dd6bb6a02d';