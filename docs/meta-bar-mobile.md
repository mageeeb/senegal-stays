# MetaBar (Mobile) – Wrapping and Spacing Rules

Scope: Mobile-only metadata component for the property detail page.

Layout (updated)
- Single line on mobile: star + rating + "X commentaires" (clickable) + location (truncated if long).
- The specs line ("N voyageurs • N chambres • N salles de bain") is removed on mobile to reduce clutter.

Wrapping control
- Use a centered dot separator with even side padding (8–12 px) between groups: implemented via a Separator span with px-2.
- Location is truncated with ellipsis and a max width: `.truncate.max-w-[60vw]` on mobile.

Typography
- Title reduced to 22–24 px on mobile: `text-2xl md:text-3xl`.
- MetaBar uses `text-sm` with `leading-[1.45]` and secondary color (`text-muted-foreground`).
- Icons are 16 px and aligned with text.

Interactions & a11y
- "X commentaires" and the location are buttons with visible focus rings and comfortable touch areas (`py-2` within a row with `min-h-11`).
- Click on comments scrolls to `#reviews-section`.
- Click on location scrolls to `#location-section`.
- Rating displayed with comma.
- Color contrast uses design tokens to meet AA.

Notes
- This component is shown only on mobile (`md:hidden`) and does not affect tablet/desktop layouts.
- Breakpoint scope: mobile only; tablet/desktop layouts remain unchanged.
- If live rating/comment counts are introduced later, wire them as props.
