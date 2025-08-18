# Tablet Search Block (Long Stays) – Responsive Rules

Context: Tablet (769–1024 px) layout and behavior for the "Recherche" block on the Long Stays page.

Applied rules
- Breakpoints
  - Tablet range: Tailwind `md` (≥768px) up to `< 1024px` (`lg`).
  - Implemented a tablet-only form using `hidden md:grid lg:hidden` (encapsulated in TabletSearchBlock).
  - Kept a default form for mobile (<768) and desktop (≥1024) using `block md:hidden lg:block`.

- Grid
  - Tablet grid: `grid-cols-2`, two rows (`gap-4`).
  - Row 1: Ville | Budget min (FCFA/mois)
  - Row 2: Budget max (FCFA/mois) | Meublé + bouton Rechercher aligné à droite (dans la même colonne)

- Spacing and sizing
  - Controls min touch height: `h-11` (~44 px) on tablet for inputs and CTA.
  - Inter-field gaps: 16 px (`gap-4`).
  - Internal padding uses component defaults; CTA uses `px-6`.

- Inputs and accessibility
  - Numeric fields use `type=number`, `inputMode=numeric`, `pattern="[0-9]*"` and explicit placeholders like `200000 (FCFA/mois)`.
  - Meublé: exclusive selection Oui | Non via a small segmented control; no default selected (optional). Clicking the active choice toggles back to neutral (Tous).
  - Validation: Budget min ≤ Budget max. Inline error displayed below the grid (aria-live="polite").
  - Focus outlines rely on design tokens; labels are visible (`block`, `mb-1`).

- Behavior differences by breakpoint
  - Tablet: Shows Ville, Budget min, Budget max, Meublé Oui/Non and a Rechercher button on the same row as Meublé (aligned to the right).
  - Mobile/Desktop: Original form preserved (min + max + meublé select + charges, desktop split across two rows).

Notes
- If you prefer forcing a default for Meublé, set it to `all` (neutral) and prevent toggle-to-neutral behavior.
- This change is scoped to the Long Stays page. If another "Recherche" block exists elsewhere, replicate the same pattern.
