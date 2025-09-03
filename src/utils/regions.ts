// Source de vérité: mapping des régions du Sénégal et des villes/lieux associés
// Fournit:
// - REGIONS: tableau de configs d'affichage (nom, slug, image, tags)
// - mapLocationToRegion: fonction de mapping ville/adresse -> slug de région
// - getRegionBySlug: utilitaire pour récupérer la config d'une région
// - SHOW_EMPTY_REGIONS: option pour afficher/masquer les régions sans logements

export type RegionSlug =
  | 'dakar'
  | 'saint-louis'
  | 'saly'
  | 'casamance'
  | 'sine-saloum'
  | 'goree'
  | 'lompoul'
  | 'thies';

export interface RegionConfig {
  slug: RegionSlug;
  name: string;
  image: string; // chemin public
  tags: string[];
}

// Option pour afficher les régions sans logements sur la Home
export const SHOW_EMPTY_REGIONS = true;

// Util: normalisation pour comparaisons (accents/casse/espaces)
export const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, ' ') // garder lettres/chiffres
    .trim();

// Listes de mots-clés/synonymes permettant de détecter la région à partir de city/adresse
// L'ordre et la spécificité sont importants: on teste les cas les plus spécifiques d'abord.
const regionKeywords: Record<RegionSlug, string[]> = {
  dakar: [
    'dakar', 'plateau', 'almadies', 'ngor', 'yoff', 'mamelles', 'ouakam', 'liberte', 'sacre coeur',
    'mermoz', 'fann', 'point e', 'maristes', 'sicap', 'grand yoff', 'rufisque', 'lac rose', 'niayes'
  ],
  'saint-louis': [
    'saint louis', 'ile de saint louis', 'hydrobase', 'langue de barbarie', 'gandon', 'guet ndar'
  ],
  saly: [
    'saly', 'saly portudal', 'saly portugal', 'mbour', 'petite cote' // on priorisera 'saly' face à thies
  ],
  casamance: [
    'cap skirring', 'ziguinchor', 'oussouye', 'kafountine', 'abene', 'carabane', 'mlomp', 'casamance'
  ],
  'sine-saloum': [
    'sine saloum', 'palmarin', 'palmarin facao', 'ndangane', 'samba dia', 'foundiougne', 'mar lodj', 'djiffer',
  ],
  goree: [
    'goree', "ile de goree", 'gorée', "île de gorée"
  ],
  lompoul: [
    'lompoul', 'desert de lompoul', 'desert', 'désert de lompoul'
  ],
  thies: [
    'thies', 'thiès', 'somone', 'ngaparou', 'popenguine', 'toubab dialaw', 'joal', 'joal fadiouth', 'fadiouth', 'nguekhokh', 'petite cote'
  ],
    saintLouis: [
    'île_nord', 'sor', 'île_sud', 'ndioloffene', 'balacosse', 'leona', 'pikine', 'cite niakh', 'tableau walo'
  ],



};

export const REGIONS: RegionConfig[] = [
  { slug: 'dakar', name: 'Dakar', image: '/img/destPop/15.jpg', tags: ['Capitale', 'Mer'] },
  { slug: 'saint-louis', name: 'Saint‑Louis', image: '/img/destPop/6.jpg', tags: ['Patrimoine', 'Fleuve'] },
  { slug: 'saly', name: 'Saly', image: '/img/destPop/3.jpg', tags: ['Mer', 'Balnéaire'] },
  { slug: 'casamance', name: 'Casamance', image: '/img/destPop/17.jpg', tags: ['Nature', 'Plages'] },
  { slug: 'sine-saloum', name: 'Sine‑Saloum', image: '/img/destPop/9.jpg', tags: ['Delta', 'Mangroves'] },
  { slug: 'goree', name: 'Gorée', image: '/img/destPop/19.jpg', tags: ['Patrimoine', 'Île'] },
  { slug: 'lompoul', name: 'Lompoul', image: '/img/destPop/4.jpg', tags: ['Désert'] },
  { slug: 'thies', name: 'Thiès', image: '/img/destPop/14.jpg', tags: ['Petite Côte'] },
];

export const getRegionBySlug = (slug: string): RegionConfig | undefined => {
  const key = normalize(slug).replace(/\s+/g, '-');
  return REGIONS.find(r => r.slug === (key as RegionSlug));
};

// Mapping heuristique: utilise city puis address pour déterminer la région.
export function mapLocationToRegion(city?: string | null, address?: string | null): RegionSlug | null {
  const fields = [city || '', address || ''];
  const haystack = normalize(fields.filter(Boolean).join(' | '));

  // Cas spécifique: Saly avant Thiès si 'saly' apparaît
  if (haystack.includes('saly')) return 'saly';

  for (const [slug, words] of Object.entries(regionKeywords) as [RegionSlug, string[]][]) {
    for (const w of words) {
      if (haystack.includes(normalize(w))) return slug;
    }
  }
  return null;
}

// Villes proposées pour filtrage côté base lorsque c'est possible
export const REGION_CITIES: Record<RegionSlug, string[]> = {
  dakar: ['Dakar', 'Plateau', 'Almadies', 'Ngor', 'Yoff', 'Mamelles', 'Ouakam', 'Rufisque', 'Lac Rose'],
  'saint-louis': ['Saint-Louis', 'Île de Saint-Louis', 'Hydrobase', 'Langue de Barbarie', 'Gandon'],
  saly: ['Saly', 'Saly Portudal', 'Saly Portugal', 'Mbour'],
  casamance: ['Cap Skirring', 'Ziguinchor', 'Oussouye', 'Kafountine', 'Abéné', 'Carabane', 'Mlomp'],
  'sine-saloum': ['Sine-Saloum', 'Palmarin', 'Ndangane', 'Samba Dia', 'Foundiougne', 'Mar Lodj', 'Djiffer'],
  goree: ['Gorée', 'Île de Gorée', 'Ile de Goree'],
  lompoul: ['Lompoul', 'Désert de Lompoul', 'Desert de Lompoul'],
  thies: ['Thiès', 'Thies', 'Somone', 'Ngaparou', 'Popenguine', 'Toubab Dialaw', 'Joal', 'Joal-Fadiouth', 'Fadiouth', 'Nguekhokh', 'Mbour'],
};
