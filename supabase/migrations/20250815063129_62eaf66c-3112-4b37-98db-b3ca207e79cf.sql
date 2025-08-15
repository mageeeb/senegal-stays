-- Créer une table pour les véhicules
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'economy', 'compact', 'suv', 'luxury', 'van'
  fuel_type TEXT NOT NULL DEFAULT 'petrol', -- 'petrol', 'diesel', 'electric', 'hybrid'
  transmission TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'automatic'
  seats INTEGER NOT NULL DEFAULT 5,
  doors INTEGER NOT NULL DEFAULT 4,
  price_per_day NUMERIC NOT NULL,
  image_url TEXT,
  features TEXT[], -- Array of features like ['GPS', 'AC', 'Bluetooth']
  is_available BOOLEAN NOT NULL DEFAULT true,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les réservations de véhicules
CREATE TABLE public.vehicle_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  return_location TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  driver_license_number TEXT,
  additional_drivers INTEGER DEFAULT 0,
  insurance_type TEXT DEFAULT 'basic', -- 'basic', 'comprehensive', 'premium'
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_bookings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les véhicules (tout le monde peut voir les véhicules disponibles)
CREATE POLICY "Anyone can view available vehicles"
ON public.vehicles
FOR SELECT
USING (is_available = true);

-- Politiques RLS pour les réservations de véhicules
CREATE POLICY "Users can view their own vehicle bookings"
ON public.vehicle_bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehicle bookings"
ON public.vehicle_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle bookings"
ON public.vehicle_bookings
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_bookings_updated_at
BEFORE UPDATE ON public.vehicle_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des exemples de véhicules
INSERT INTO public.vehicles (name, brand, model, year, category, fuel_type, transmission, seats, doors, price_per_day, image_url, features, location, description) VALUES
('Peugeot 208 Économique', 'Peugeot', '208', 2023, 'economy', 'petrol', 'manual', 5, 4, 25000, '/img/destPop/1.jpg', ARRAY['Climatisation', 'Radio Bluetooth', 'Direction assistée'], 'Dakar Centre', 'Voiture économique parfaite pour se déplacer en ville'),
('Toyota Corolla Confort', 'Toyota', 'Corolla', 2022, 'compact', 'petrol', 'automatic', 5, 4, 35000, '/img/destPop/2.jpg', ARRAY['GPS', 'Climatisation', 'Bluetooth', 'Caméra de recul'], 'Aéroport Dakar', 'Berline confortable avec boîte automatique'),
('Hyundai Tucson SUV', 'Hyundai', 'Tucson', 2023, 'suv', 'diesel', 'automatic', 7, 5, 55000, '/img/destPop/3.jpg', ARRAY['4x4', 'GPS', 'Climatisation bi-zone', 'Toit panoramique', 'Sièges cuir'], 'Saly Portudal', 'SUV spacieux idéal pour les familles et excursions'),
('Mercedes Classe E Luxe', 'Mercedes-Benz', 'Classe E', 2023, 'luxury', 'petrol', 'automatic', 5, 4, 85000, '/img/destPop/4.jpg', ARRAY['GPS Premium', 'Sièges massage', 'Climatisation 4 zones', 'Son Harman Kardon', 'Cuir Nappa'], 'Almadies', 'Berline de luxe pour un voyage d''exception'),
('Ford Transit Van', 'Ford', 'Transit', 2022, 'van', 'diesel', 'manual', 9, 4, 45000, '/img/destPop/5.jpg', ARRAY['Grand volume', 'Climatisation', 'Radio', 'Crochet remorquage'], 'Rufisque', 'Van spacieux pour groupes et transport de matériel'),
('Nissan Qashqai Crossover', 'Nissan', 'Qashqai', 2023, 'suv', 'petrol', 'automatic', 5, 5, 45000, '/img/destPop/6.jpg', ARRAY['GPS', 'Climatisation auto', 'Bluetooth', 'Jantes alliage', 'Feux LED'], 'Saint-Louis', 'Crossover moderne et économique');