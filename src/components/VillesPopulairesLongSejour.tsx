import React, { useEffect, useState } from "react";
import { fetchPopularLongStayCitiesSenegal } from "@/services/longStays";

const FALLBACK_VILLES_SENEGAL = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Saly",
  "Mbour",
  "Ziguinchor",
  "Touba",
  "Kaolack",
];

type Props = {
  onSelectCity?: (city: string) => void;
};

export function VillesPopulairesLongSejour({ onSelectCity }: Props) {
  const [villes, setVilles] = useState<{ city: string; bookings_count?: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPopularLongStayCitiesSenegal()
      .then((rows) => {
        if (!mounted) return;
        setVilles(rows.length ? rows : FALLBACK_VILLES_SENEGAL.map((c) => ({ city: c })));
      })
      .catch(() => {
        if (!mounted) return;
        setVilles(FALLBACK_VILLES_SENEGAL.map((c) => ({ city: c })));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {villes.map(({ city }) => (
        <button
          key={city}
          className="rounded-lg border px-3 py-2 hover:bg-accent text-left"
          onClick={() => onSelectCity?.(city)}
        >
          {city}
        </button>
      ))}
    </div>
  );
}
