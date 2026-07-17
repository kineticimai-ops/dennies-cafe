# Dennie's Café — Website Build Spec

**Status:** Approved by Keiron 2026-07-17
**Project:** Replace the Hercules-generated site with a self-owned site on Keiron's standard stack.
**Primary domain:** denniescafe.co.uk (owned, Namecheap). denniescafe.shop redirects to it.
**Dual purpose:** (1) working site for the café, (2) flagship case study for the local business digital services offer.

---

## 1. Stack (per keiron-stack skill — do not deviate)

- Node.js + Express serving a static site (no database, no CMS)
- Git + GitHub repo: `dennies-cafe`
- Render free tier, auto-deploy from `main`
- Namecheap → Cloudflare nameservers → Cloudflare DNS to Render, SSL via Cloudflare
- No payments, no API keys needed for v1 — this is a brochure site. No .env required yet; still add `.gitignore` with `node_modules` and `.env` from the start.
- Render cold starts (~30–60s after idle): acceptable for v1. Cloudflare caching of static assets mitigates. Note for later: if the café site matters commercially, a paid tier or static host is the fix — do not solve this now.

## 2. Site structure

Single-page site with anchor navigation, plus one standalone menu page (printable/linkable).

```
/            → index.html  (hero, about, menu highlights, reviews, find us, hours)
/menu        → menu.html   (full menu with prices)
/robots.txt
/sitemap.xml
```

Nav: About · Menu · Reviews · Find Us · [Call button on mobile]

## 3. Content — real data only

**Name:** Dennie's Cafe
**Address:** 7a Elm Grove, Station Rd, Cowfold, Horsham RH13 8DA
**Phone:** 01403 900317
**Hours (CONFIRMED by Keiron 17 Jul 2026):** Mon–Fri 8:30–15:30 · Sat 8:30–14:30 · Sun closed
*(Ensure the Google Business Profile and Facebook both show exactly these hours — any mismatch is a NAP/hours inconsistency to fix at launch.)*
**Rating:** 4.9★ on Google (64 reviews at time of writing — pull live count before launch or word it as "Rated 4.9★ by our customers on Google")

**Voice:** Warm, plain-spoken, village-scale. No corporate copy, no "beloved local cafe nestled in" filler. Reference points from real reviews: "a tiny café with a big warm heart", quality fillings, cosy upstairs seating. Write like the sign outside: Hot & Cold Drinks, Sandwiches, Cakes, Sweets & Afternoon Tea.

**Fix from old site:** remove "Run by Dennie, who personally greets every guest" unless Keiron confirms wording. Get the actual one-line origin story from Keiron (who runs it, how long).

### Hero
- Real shopfront photo (supplied: striped awning, hand-lettered menu board)
- H1: `Dennie's Cafe — Cowfold`
- Kicker (SEO + honest): `Breakfast, sandwiches & proper coffee in Cowfold village`
- One CTA: **See the Menu**, secondary: **Find Us**
- Hours strip immediately visible

### Menu (prices CONFIRMED by Keiron 17 Jul 2026 — current prices, no rises applied yet)

| Item | Price |
|---|---|
| Latte (regular / large) | £3.25 / £3.50 |
| Cappuccino (regular / large) | £3.25 / £3.50 |
| Flat white (regular / large) | £3.25 / £3.50 |
| Americano (large) | £3.15 |
| Tea (pot) | £3.50 |
| Hot chocolate | £3.95 |
| Full English breakfast | £9.50 |
| Bacon sandwich | £5.25 |
| Sausage sandwich | £5.25 |
| Freshly made sandwiches | £5.50 |
| Toastie | £5.75 |
| Flapjack / Millionaire shortbread | £3.50 |
| Cake (slice) | £3.50 |
| Tiffin | £3.75 |
| Milkshakes | £3.95 / £4.95 fully loaded |
| Soft drinks / Ribena / energy drinks | £1.00–£2.00 |
| Soya milk | +£1.00 |

Menu page must carry every item Keiron wants listed, not just these — confirm the full list with him during the build session.

Include line: *"Everything made fresh to order. Eat in or take away."* and *"Daily specials — ask when you visit."*

### Reviews section
- 4.9★ badge + three short real quotes from Google reviews (Keiron to pick — do not invent)
- Link: **Read our reviews on Google** (link to the Google reviews page)
- Below it, the review-request line with the same QR/short link used on the till card, so site and till card are one system

### Find Us
- Embedded Google Map (standard embed, no API key needed)
- Address, phone (tel: link), parking/one-line directions from Keiron
- Mention A272 / village location naturally in copy for local search

## 4. Photos required from Keiron (phone, daylight, real)
1. Shopfront (have it ✔)
2. Interior / seating, including upstairs if it photographs well
3. Counter / cake display
4. Bacon sandwich or full English
5. Latte with art if possible
6. 1–2 spares (specials board, outside seating)

Build with named placeholder slots (`hero.jpg`, `interior.jpg`, `counter.jpg`, `food-1.jpg`, `coffee.jpg`) so the build never blocks on photos. Compress to WebP, max ~1600px wide, lazy-load below the fold.

## 5. SEO requirements (this is the case-study substance)

- `<title>`: `Dennie's Cafe Cowfold | Breakfast, Sandwiches & Coffee near Horsham`
- Meta description: `Family-run village cafe in Cowfold, West Sussex. Cooked breakfasts, freshly made sandwiches, cakes and proper coffee. Eat in or take away. Open Mon–Sat.`
- One H1 only; semantic headings; alt text on every image describing the real content
- **JSON-LD schema, type `CafeOrCoffeeShop`:** name, address (structured), phone, geo coordinates, openingHoursSpecification (exact match with Google profile), priceRange `£`, servesCuisine, image, url, `hasMenu` pointing to /menu, aggregateRating only if implemented per Google's current guidelines — otherwise omit rather than risk it
- sitemap.xml + robots.txt; submit to Google Search Console (Keiron sets up GSC — free, and it becomes the before/after evidence for the case study)
- Cloudflare: full SSL, HTTP→HTTPS, denniescafe.shop 301 → denniescafe.co.uk
- Performance target: Lighthouse 90+ on mobile. It's a static page with five images — there is no excuse otherwise.

## 6. NAP consistency rule (critical for local SEO)
Name, address, phone must be **character-identical** across: website footer, schema markup, Google Business Profile, Facebook page. Pick the canonical form once ("Dennie's Cafe", "7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA", "01403 900317") and use it everywhere. Audit the Google profile and Facebook to match after launch.

## 7. Explicitly out of scope for v1
- Online ordering / delivery integration
- Booking system
- Newsletter / mailing list
- Blog
- AI features of any kind

Ship the brochure site, wire up Search Console, take the baseline screenshots (current rankings for "cafe cowfold", "breakfast cowfold", "cafe near horsham a272") **before** launch — the before/after is the sales asset.

## 8. Launch checklist
1. Repo + skeleton + /health route → Render deploy green
2. Content in with placeholder images → Keiron reviews copy on his phone
3. Real photos in, compressed
4. Schema validated (Google Rich Results test)
5. Cloudflare DNS cutover + .shop redirect
6. Google Business Profile: set website field to denniescafe.co.uk, align NAP, add menu link
7. GSC verified, sitemap submitted, baseline ranking screenshots archived
8. Old Hercules site: point/retire so there's no duplicate site competing
