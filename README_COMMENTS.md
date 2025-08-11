Comments (Avis) feature on PropertyDetail

What was added
- A reusable CommentsSection component (src/components/CommentsSection.tsx) that lazy-loads reviews for a given property_id from Supabase.
- Toggle button to show/hide comments with aria-expanded, aria-controls and keyboard focus support.
- Loading and error states with retry.
- In-memory cache per component instance: once loaded, comments are kept in memory while you toggle.
- Displays a vertical list of review cards: 5-star rating, reviewer name (if available in profiles), date, comment. The date is formatted as “MMM yyyy”.
- Pagination: If the total number of reviews is over 50, a simple “Afficher plus” loads 10 more at a time. If 50 or less, the first open loads all.
- After the first successful load, the view scrolls to the comments section.

Where it is used
- Integrated in src/pages/PropertyDetail.tsx replacing the previous static placeholder.

Data assumptions
- Supabase tables used: public.reviews (id, rating, comment, created_at, reviewer_id, property_id) and public.profiles (user name fields). The join is done via reviews_reviewer_id_fkey.

How to test (manual)
1) With existing comments
   - Open a Property detail that has reviews.
   - Click “Afficher tous les commentaires”.
   - Expect loading state, then the list with stars, date, comment. Button toggles to “Masquer les commentaires”.
   - If more than 50 reviews exist total, “Afficher plus” should appear; clicking it loads 10 more.
   - Toggle hide/show: data should be cached (no refetch needed unless you refresh the page).
   - Verify keyboard navigation: Tab to the button; aria-expanded should reflect state.

2) With zero comments
   - Open a Property with no reviews.
   - Click the button; after loading completes, you should see “Aucun commentaire pour l’instant.”

3) Simulate network error
   - Temporarily break network or Supabase URL, or block the reviews request in devtools.
   - Click the button; expect an error banner and a “Réessayer” button. Clicking retry should attempt the request again.

Limitations and notes
- Aggregated rating/count in the title is based on loaded data; for large lists it reflects loaded + known total count. For a true global aggregate independent of loaded page, consider a materialized view or a separate aggregate query.
- Date is formatted with date-fns using a generic locale-free pattern; for full French month names, import fr locale in date-fns and pass it to format.
- The component caches in memory for the lifetime of the page. Navigating away clears it.

Accessibility
- The toggle button has aria-expanded and aria-controls.
- The list region uses role="region" and aria-live="polite" for state updates.
- Focus and keyboard usage is standard as it uses a native button element.
