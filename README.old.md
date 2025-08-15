# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/09266781-f338-43b1-9b10-d885c2578eed

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/09266781-f338-43b1-9b10-d885c2578eed) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/09266781-f338-43b1-9b10-d885c2578eed) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/09266781-f338-43b1-9b10-d885c2578eed

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/09266781-f338-43b1-9b10-d885c2578eed) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/09266781-f338-43b1-9b10-d885c2578eed) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Regions mapping and home grid

Source of truth
- See src/utils/regions.ts for the canonical list of regions (8), their tags, images, and the mapping function.
- mapLocationToRegion(city, address) normalizes accents/case and maps properties to regions (e.g., Plateau/Ngor/Lac Rose -> Dakar; Saly Portudal/Portugal -> Saly). Joal-Fadiouth and Petite Côte locales default to Thiès unless city contains "Saly".

Maintenance plan
- Update REGION_CITIES to fine-tune server-side filtering possibilities, and regionKeywords for heuristics.
- Option SHOW_EMPTY_REGIONS toggles visibility of regions with 0 listings on the home grid.
- Add new regions by extending REGIONS and regionKeywords; ensure images exist under public/img/destPop.

UX/UI
- Home now shows a responsive grid of region cards (light/dark) with subtle hover/press effects, tags, and counts with skeleton loaders.
- Clicking a region routes to /destination/:regionSlug and filters listings accordingly.

---

## Map UX iteration (clusters, markers, animations)

Preview/prototype
- Pages using the new map: /destination/:area and /property/:id now render clustered markers with smooth zoom/expand and interactive tooltips/popovers. Run locally with npm run dev and navigate to those pages to preview.
- To record a short GIF prototype: use your OS screen recorder or e.g. ffmpeg/QuickTime while zooming/panning and interacting with clusters and points.

Specs (v1)
- Colors: respect current theme; cluster circles use blue hues on dark map style, with white text; unclustered points use hsl(210,100%,60%) with white stroke on hover.
- Marker states: normal (opacity 0.9), hover (thicker white stroke), selected (opacity 1 – via feature state, ready to wire to selection logic).
- Sizes: unclustered radius 5 @z8, 7 @z12, 9 @z16; cluster circle 16/20/24/28 depending on count thresholds (10/25/50).
- Typography: cluster count text-size 12, system fonts fallback.
- Animations: paint property transitions 200–300ms; smooth pan/zoom via map.easeTo; popup/tooltip subtle fade handled by Mapbox GL.
- Accessibility: high-contrast cluster text; focus/keyboard navigation supported by native Mapbox controls; popovers include clear labels and CTA; hover tooltips readable.

Technical notes
- Library: mapbox-gl (already in deps). We kept the existing dark-v11 style and added a GeoJSON clustered source with circle + symbol layers. Hover tooltip and click popover are implemented with accessible HTML.
- Performance: vector layers (no DOM markers) for large datasets; clustering handled natively; transitions kept subtle to sustain 60 fps on modern desktops and ok on mobile.

Extensibility
- New point types can be added by extending feature properties and adding layer style filters; CTA and content are data-driven (title, price, image_url).

Effort estimate & delivery plan
- MVP (this PR): clustering, hover tooltip, click popover, smooth zoom/pan, basic animations and states. Est: 0.5–1.5 days depending on data variety. ✓
- Polish: custom SVG pin icons per state/type, selection syncing with list, keyboard focus ring, reduced motion preference, unit tests for map utils. Est: 1–2 days.
- Optional: server-driven tiles/cluster caching for very large datasets; screenshot/GIF automation. Est: 0.5–1 day.

Open questions
- Préférez-vous des markers vectoriels simples (actuels) ou une mini librairie d’icônes dédiée (SVG pins) pour l’étape suivante ?
- Avez-vous un mapping des types de points et métadonnées (catégories, priorités, états) que l’on peut intégrer ?
- Contraintes techniques/design à poser (style clair/sombre, densité max, perf mobile spécifiques) ?
- Un créneau de 15 min cette semaine pour un alignement rapide ? Indiquez vos disponibilités.
