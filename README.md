# Teranga Home (Senegal Stays)

A simple, fast, accessible platform to discover and book unique stays in Senegal.

## Tech stack
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (data)

## Scripts
- dev: Start local dev server
- build: Production build
- preview: Preview the production build locally
- lint: Lint the project

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Deploy
This project ships as a standard Vite React app. You can deploy the production build (dist/) to any static hosting (Vercel, Netlify, Cloudflare Pages, S3 + CDN, etc.).

Build locally:
```bash
npm ci
npm run build
```
Then upload the dist/ folder to your hosting provider.

## PWA
- The app is installable (manifest + service worker).
- Meta tags include viewport-fit=cover and theme-color for light/dark.
- Service worker is registered only in production. Ensure your host serves over HTTPS.

## Notes
- Brand assets (logo, favicons) are currently placeholders. We will update them when the final assets are provided.
- Please purge CDN caches after deploying branding changes.
- See docs/ux-pwa-plan.md for the mobile/tablet app-like plan, estimates, and QA checklist.
