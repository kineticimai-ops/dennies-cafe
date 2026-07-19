# Dennie's Cafe Website

Static brochure site for Dennie's Cafe, Cowfold — Node/Express serving `public/`.

## Local development

```bash
npm install
npm start        # serves on http://localhost:3000
npm test         # runs the test suite (node --test)
```

## Open items before launch (do not skip — see design spec)

- [x] Get the real one-line origin story from Keiron, replace the placeholder in `public/index.html` (About section).
- [x] Get 3 real Google review quotes, replace the three placeholder `<blockquote>` entries in `public/index.html` (Reviews section) — done: Jonathan, Andy, Terry (first name only), pulled live from Google and picked by Keiron.
- [x] Get parking/directions line from Keiron, replace the placeholder in `public/index.html` (Find Us section). — done: "On-street parking only."
- [x] Get exact geo coordinates for 7a Elm Grove, Station Road, Cowfold RH13 8DA from Google Maps (right-click the pin, copy lat/long) and update the JSON-LD `geo` block in `public/index.html`. — done: 50.990457, -0.27434.
- [x] Get the till-card QR/short link from Keiron and add it next to the Google reviews link. — dropped: no QR link exists, not doing this for v1.
- [ ] Confirm the rest of the menu Keiron wants listed (specials, extras beyond what's in `public/menu.html`).
- [x] Replace placeholder SVGs in `public/images/` with real compressed photos — done: hero, interior, counter, food-1, coffee plus 3 gallery spares (outdoor-seating, upstairs, pavement-sign), all WebP.
- [x] Pull the live Google review count, or keep the "Rated 4.9★ by our customers on Google" wording to avoid a stale number. — decided: keep the wording, no live count.
- [x] Confirm "Family-run" in the meta description (`public/index.html`) is accurate, or get Keiron to approve/reword it — confirmed accurate by Keiron.

## Deployment (per keiron-stack)

1. Create GitHub repo `dennies-cafe`, push `main`.
2. Create a new Render Web Service, connect the GitHub repo, auto-deploy from `main`. Build command: `npm install`. Start command: `npm start`.
3. Confirm `/health` returns 200 on the live Render URL.
4. Namecheap: point `denniescafe.co.uk` nameservers to Cloudflare.
5. Cloudflare: add the domain, set DNS to the Render service, enable Full SSL and HTTP→HTTPS redirect.
6. Set up `denniescafe.shop` to 301 redirect to `denniescafe.co.uk` (Cloudflare Page Rule or Bulk Redirect).
7. Validate the JSON-LD schema with Google's Rich Results Test.
8. Google Business Profile: set website to `denniescafe.co.uk`, confirm NAP and hours match exactly, add the `/menu` link.
9. Audit Facebook page for matching NAP and hours.
10. Set up Google Search Console, verify domain, submit `sitemap.xml`.
11. Take baseline ranking screenshots for "cafe cowfold", "breakfast cowfold", "cafe near horsham a272" **before** wide traffic hits the new site — this is the before/after case-study evidence.
12. Run Lighthouse (mobile) — target 90+. Fix anything below that before calling it done.
13. Retire or redirect the old Hercules-generated site so there's no duplicate competing for rankings.
