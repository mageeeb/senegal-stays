import { supabase } from "@/integrations/supabase/client";

export type PopularCityRow = { city: string; bookings_count: number };

export async function fetchPopularLongStayCitiesSenegal(limit = 8): Promise<PopularCityRow[]> {
  const { data, error } = await supabase
    .from("popular_long_stay_cities_senegal" as any)
    .select("*")
    .order("bookings_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as PopularCityRow[]) ?? [];
}
