# Teranga Home: Mobile/Tablet App-like Experience & PWA Plan

This document summarizes feasibility, dependencies, resources, estimates, and milestones to deliver an app-like experience on mobile/tablet and an installable PWA.

## 1. Feasibility & Dependencies
- Feasibility: High. The codebase already uses React + Tailwind + shadcn/ui with responsive components and a swipeable, zoom-capable Gallery.
- New dependencies: None strictly required. Optional: vite-plugin-pwa for more advanced SW generation (deferred).
- External services: Supabase already integrated.
- Risks: Asset readiness for PWA icons/splash; ensuring CLS ≤ 0.1 and TTI ≤ 3.5s on low-end devices may require image optimization and code splitting.

## 2. Resources Needed
- Design: 1 designer for Figma mobile/tablet Hifi and interaction specs.
- Frontend: 1–2 engineers for implementation and perf work.
- QA: 1 QA for real-device testing and Lighthouse.
- PM/Lead: For coordination and progressive rollout.

## 3. Estimates per Workstream (Sprints are 1 week)
- Navigation (bottom nav mobile, tablet top/side, split-view where relevant): 2–3 days.
- Lists & Skeletons (home, search, results): 2–3 days.
- Property Detail (carousel swipe, sticky CTA, forms polish): 3–4 days.
- Forms (booking, auth, profile): 2–3 days incl. mobile ergonomics.
- PWA (manifest, SW, install flow, icons/splash): 2 days.
- Perf & Accessibility (Lighthouse ≥ 80/90/90, CLS ≤ 0.1): 3–4 days ongoing.

## 4. Demo Milestone
- First demo: End of S2 with interactive prototypes and partial implementation (navigation + property detail core, installable PWA).

## 5. QA Checklist (extract)
- Tap targets ≥ 44x44px on mobile.
- Bottom nav visible on mobile; tablet uses header/top nav.
- Skeletons present on list and detail loading states.
- Gallery swipe works; reduced-motion respected.
- Sticky primary CTA on detail (mobile) with safe-area support.
- Manifest valid, PWA installable; SW registered; theme-color correct in light/dark.
- Color contrast AA; dark/light themes supported.
- CLS ≤ 0.1; main interactions < 100ms; TTI ≤ 3.5s on mid-tier device.

## 6. Progressive Rollout & Metrics
- Gradual enablement of PWA install prompt.
- Track Web Vitals (CLS, INP, LCP) via RUM.
- Monitor install rate, offline usage, and crashes.

## Current Status (this commit)
- Added manifest and basic SW; app is installable.
- Added safe-area and theme meta; SW registration.
- Added skeletons and sticky mobile booking bar on property detail.
