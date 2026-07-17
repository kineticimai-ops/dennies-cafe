# Dennie's Cafe Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship a static brochure website for Dennie's Cafe (Cowfold) on Keiron's standard stack, replacing the old Hercules-generated site, serving both as a working café site and as a local-SEO case study.

**Architecture:** A single Express app serves a static `public/` folder. Two real pages (`/` and `/menu`), plus `/robots.txt` and `/sitemap.xml`. No database, no CMS, no client-side framework — plain HTML/CSS with one small Express server for routing and a `/health` check.

**Tech Stack:** Node.js + Express 4, plain HTML/CSS (no build step, no TypeScript), Node's built-in `node:test` + global `fetch` for tests (no extra test dependency needed on Node ≥18).

## Global Constraints

- Stack is fixed per `keiron-stack` skill: Node + Express, Git + GitHub (`dennies-cafe`), Render free tier, Namecheap→Cloudflare→Render. Do not deviate.
- `.gitignore` must include `node_modules` and `.env` **before the first commit** (no `.env` is needed yet, but the file must exist per convention).
- No database, no CMS, no client-side JS framework — this is a static brochure site.
- NAP (Name/Address/Phone) must be **character-identical** everywhere it appears: `Dennie's Cafe` / `7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA` / `01403 900317`.
- Hours are exact: Mon–Fri 8:30–15:30 · Sat 8:30–14:30 · Sun closed. Must match Google Business Profile and Facebook (Keiron aligns those separately).
- Real data only — never invent review quotes, the origin story, or parking directions. Where the spec flags something as pending Keiron's input, leave it as a clearly visible placeholder string in the rendered page (not a silent blank, not invented content) so it can't accidentally ship as if it were real.
- Out of scope for v1: online ordering, booking system, newsletter, blog, any AI features.
- Performance target: Lighthouse 90+ mobile. Images lazy-loaded below the fold, WebP/SVG only, no heavy JS.
- Design spec: `docs/superpowers/specs/2026-07-17-dennies-cafe-design.md` — every task below implements a section of it.

---

### Task 1: Project scaffold + health route

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `server.js`
- Test: `test/server.test.js`

**Interfaces:**
- Produces: `module.exports = app` (an Express app) from `server.js`, used by every later test file to start an ephemeral server via `app.listen(0)`.

- [ ] **Step 1: Write the failing test**

```javascript
// test/server.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../server.js');

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => {
  server.close();
});

test('GET /health returns 200 with status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.status, 'ok');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/server.test.js`
Expected: FAIL — `Cannot find module '../server.js'`

- [ ] **Step 3: Create package.json, .gitignore, and server.js**

```json
// package.json
{
  "name": "dennies-cafe",
  "version": "1.0.0",
  "private": true,
  "description": "Dennie's Cafe website - Cowfold, West Sussex",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node --test"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
```

```
# .gitignore
node_modules/
.env
```

```javascript
// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Dennie's Cafe site listening on port ${PORT}`);
  });
}

module.exports = app;
```

- [ ] **Step 4: Install express**

Run: `npm install`
Expected: `node_modules/express` installed, `package-lock.json` created.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/server.test.js`
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore server.js test/server.test.js
git commit -m "Scaffold Express app with /health route"
```

---

### Task 2: robots.txt + sitemap.xml

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Test: `test/seo-files.test.js`

**Interfaces:**
- Consumes: `app` from `server.js` (Task 1), served automatically via `express.static`.

- [ ] **Step 1: Write the failing test**

```javascript
// test/seo-files.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../server.js');

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => {
  server.close();
});

test('GET /robots.txt allows crawling and points to sitemap', async () => {
  const res = await fetch(`${baseUrl}/robots.txt`);
  assert.strictEqual(res.status, 200);
  const body = await res.text();
  assert.match(body, /User-agent: \*/);
  assert.match(body, /Sitemap: https:\/\/denniescafe\.co\.uk\/sitemap\.xml/);
});

test('GET /sitemap.xml lists home and menu pages', async () => {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  assert.strictEqual(res.status, 200);
  const body = await res.text();
  assert.match(body, /<loc>https:\/\/denniescafe\.co\.uk\/<\/loc>/);
  assert.match(body, /<loc>https:\/\/denniescafe\.co\.uk\/menu<\/loc>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/seo-files.test.js`
Expected: FAIL — both requests return 404 (files don't exist)

- [ ] **Step 3: Create the files**

```
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://denniescafe.co.uk/sitemap.xml
```

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://denniescafe.co.uk/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://denniescafe.co.uk/menu</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/seo-files.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt public/sitemap.xml test/seo-files.test.js
git commit -m "Add robots.txt and sitemap.xml"
```

---

### Task 3: CSS foundation

**Files:**
- Create: `public/css/styles.css`
- Test: `test/static-assets.test.js`

**Interfaces:**
- Produces: CSS classes consumed by `index.html` and `menu.html` in Tasks 5–7: `.nav`, `.nav__brand`, `.nav__links`, `.nav__call`, `.hero`, `.hero__image`, `.hero__content`, `.hero__kicker`, `.hero__hours`, `.hero__cta`, `.btn`, `.btn--primary`, `.btn--secondary`, `.hours-strip`, `.section`, `.menu-highlights`, `.menu-card`, `.reviews`, `.review-card`, `.rating-badge`, `.find-us`, `.map-embed`, `.site-footer`, `.menu-table`.

- [ ] **Step 1: Write the failing test**

```javascript
// test/static-assets.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../server.js');

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => {
  server.close();
});

test('GET /css/styles.css is served as CSS', async () => {
  const res = await fetch(`${baseUrl}/css/styles.css`);
  assert.strictEqual(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/css/);
  const body = await res.text();
  assert.match(body, /\.nav__call/);
  assert.match(body, /\.hero__cta/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/static-assets.test.js`
Expected: FAIL — 404, file doesn't exist

- [ ] **Step 3: Write the CSS**

```css
/* public/css/styles.css */
:root {
  --cream: #faf3e8;
  --coffee: #4a2f21;
  --coffee-light: #6b4530;
  --terracotta: #c1652f;
  --cream-dark: #ede0c9;
  --text: #2c2018;
  --radius: 10px;
  --max-width: 1080px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Georgia', 'Times New Roman', serif;
  background: var(--cream);
  color: var(--text);
  line-height: 1.5;
}

h1, h2, h3 { font-family: 'Georgia', serif; line-height: 1.2; margin: 0 0 0.5em; }

a { color: var(--terracotta); }

img { max-width: 100%; display: block; }

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--coffee);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav__brand {
  color: var(--cream);
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
}

.nav__links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.nav__links a {
  color: var(--cream);
  text-decoration: none;
}

.nav__call {
  display: none;
  background: var(--terracotta);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: bold;
}

@media (max-width: 640px) {
  .nav__links { display: none; }
  .nav__call { display: inline-block; }
}

.hero {
  position: relative;
}

.hero__image {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
}

.hero__content {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
}

.hero__kicker {
  color: var(--coffee-light);
  font-style: italic;
  margin-bottom: 0.25rem;
}

.hero__hours {
  margin: 1rem 0;
  font-weight: bold;
  background: var(--cream-dark);
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
}

.hero__cta { margin-top: 1rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: bold;
}

.btn--primary { background: var(--terracotta); color: white; }
.btn--secondary { background: transparent; color: var(--coffee); border: 2px solid var(--coffee); }

.section {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.menu-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.menu-card {
  background: white;
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
}

.reviews { background: var(--cream-dark); }

.rating-badge {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--terracotta);
}

.review-card {
  background: white;
  border-radius: var(--radius);
  padding: 1rem;
  margin: 1rem 0;
  font-style: italic;
}

.map-embed iframe {
  width: 100%;
  height: 320px;
  border: 0;
  border-radius: var(--radius);
}

.site-footer {
  background: var(--coffee);
  color: var(--cream);
  padding: 2rem 1.5rem;
  text-align: center;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.menu-table th, .menu-table td {
  text-align: left;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid var(--cream-dark);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/static-assets.test.js`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add public/css/styles.css test/static-assets.test.js
git commit -m "Add base stylesheet"
```

---

### Task 4: Placeholder image slots

**Files:**
- Create: `public/images/hero.svg`
- Create: `public/images/interior.svg`
- Create: `public/images/counter.svg`
- Create: `public/images/food-1.svg`
- Create: `public/images/coffee.svg`
- Modify: `test/static-assets.test.js`

**Interfaces:**
- Produces: five named image slots at `/images/<name>.svg`, referenced by `index.html` in Task 5. When Keiron supplies real photos, save each as `public/images/<name>.jpg` (compressed WebP/JPEG, max ~1600px wide) and change the matching `<img src="...">` in `index.html` from `.svg` to `.jpg` — five one-line edits, no other changes needed.

- [ ] **Step 1: Write the failing test (append to existing file)**

```javascript
// Add to test/static-assets.test.js, inside the same file, after the styles.css test:

test('GET /images/hero.svg is served as SVG', async () => {
  const res = await fetch(`${baseUrl}/images/hero.svg`);
  assert.strictEqual(res.status, 200);
  assert.match(res.headers.get('content-type'), /image\/svg\+xml/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/static-assets.test.js`
Expected: FAIL — 404 on `/images/hero.svg`

- [ ] **Step 3: Create the five placeholder SVGs**

Each is a simple labeled placeholder box so the site never blocks on real photos.

```xml
<!-- public/images/hero.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#ede0c9"/>
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="48" fill="#4a2f21" text-anchor="middle">Shopfront photo — coming soon</text>
</svg>
```

```xml
<!-- public/images/interior.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#ede0c9"/>
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="40" fill="#4a2f21" text-anchor="middle">Interior seating photo — coming soon</text>
</svg>
```

```xml
<!-- public/images/counter.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#ede0c9"/>
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="40" fill="#4a2f21" text-anchor="middle">Counter &amp; cake display photo — coming soon</text>
</svg>
```

```xml
<!-- public/images/food-1.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#ede0c9"/>
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="40" fill="#4a2f21" text-anchor="middle">Bacon sandwich / full English photo — coming soon</text>
</svg>
```

```xml
<!-- public/images/coffee.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#ede0c9"/>
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="40" fill="#4a2f21" text-anchor="middle">Latte with art photo — coming soon</text>
</svg>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/static-assets.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add public/images test/static-assets.test.js
git commit -m "Add named placeholder image slots"
```

---

### Task 5: index.html — nav, hero, about, hours

**Files:**
- Create: `public/index.html`
- Test: `test/index-content.test.js`

**Interfaces:**
- Consumes: `.nav*`, `.hero*`, `.btn*`, `.hero__hours` classes from Task 3; `/images/hero.svg` from Task 4.
- Produces: the `<head>` block (title, meta description, canonical) reused unmodified when Task 6 appends the rest of the body — Task 6 edits this same file, so its `<head>` must not be duplicated or changed.

- [ ] **Step 1: Write the failing test**

```javascript
// test/index-content.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../server.js');

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => {
  server.close();
});

test('GET / has the correct title and meta description', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.strictEqual(res.status, 200);
  const body = await res.text();
  assert.match(body, /<title>Dennie's Cafe Cowfold \| Breakfast, Sandwiches &amp; Coffee near Horsham<\/title>/);
  assert.match(body, /Family-run village cafe in Cowfold, West Sussex/);
});

test('GET / has exactly one H1 with the cafe name', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  const h1Matches = body.match(/<h1[^>]*>/g) || [];
  assert.strictEqual(h1Matches.length, 1);
  assert.match(body, /<h1[^>]*>Dennie's Cafe — Cowfold<\/h1>/);
});

test('GET / shows the exact confirmed hours', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /Mon–Fri 8:30–15:30 · Sat 8:30–14:30 · Sun closed/);
});

test('GET / has a tel: link with the correct phone number', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /href="tel:\+441403900317"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/index-content.test.js`
Expected: FAIL — 404, `public/index.html` doesn't exist

- [ ] **Step 3: Write index.html (head, nav, hero, about, hours strip)**

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dennie's Cafe Cowfold | Breakfast, Sandwiches &amp; Coffee near Horsham</title>
<meta name="description" content="Family-run village cafe in Cowfold, West Sussex. Cooked breakfasts, freshly made sandwiches, cakes and proper coffee. Eat in or take away. Open Mon–Sat.">
<link rel="canonical" href="https://denniescafe.co.uk/">
<link rel="stylesheet" href="/css/styles.css">
</head>
<body>

<header class="site-header">
  <nav class="nav">
    <a href="/" class="nav__brand">Dennie's Cafe</a>
    <ul class="nav__links">
      <li><a href="#about">About</a></li>
      <li><a href="/menu">Menu</a></li>
      <li><a href="#reviews">Reviews</a></li>
      <li><a href="#find-us">Find Us</a></li>
    </ul>
    <a href="tel:+441403900317" class="nav__call">Call 01403 900317</a>
  </nav>
</header>

<section class="hero">
  <img src="/images/hero.svg" alt="Dennie's Cafe shopfront in Cowfold, with striped awning and hand-lettered menu board" class="hero__image">
  <div class="hero__content">
    <p class="hero__kicker">Breakfast, sandwiches &amp; proper coffee in Cowfold village</p>
    <h1>Dennie's Cafe — Cowfold</h1>
    <p class="hero__hours">Mon–Fri 8:30–15:30 · Sat 8:30–14:30 · Sun closed</p>
    <div class="hero__cta">
      <a href="/menu" class="btn btn--primary">See the Menu</a>
      <a href="#find-us" class="btn btn--secondary">Find Us</a>
    </div>
  </div>
</section>

<section id="about" class="section">
  <h2>About Dennie's</h2>
  <!-- TODO(keiron): replace with the real one-line origin story — who runs it, how long. Do not invent. -->
  <p>[Origin story pending — Keiron to supply a one-line story: who runs Dennie's and how long it's been serving Cowfold.]</p>
  <p>Everything made fresh to order. Eat in or take away.</p>
  <p>Daily specials — ask when you visit.</p>
</section>

</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/index-content.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add public/index.html test/index-content.test.js
git commit -m "Add homepage nav, hero, and about section"
```

---

### Task 6: index.html — menu highlights, reviews, find us, footer, JSON-LD schema

**Files:**
- Modify: `public/index.html` (insert new sections before `</body>`, add `<script type="application/ld+json">` in `<head>`)
- Modify: `test/index-content.test.js`

**Interfaces:**
- Consumes: `.menu-highlights`, `.menu-card`, `.reviews`, `.review-card`, `.rating-badge`, `.find-us`, `.map-embed`, `.site-footer` classes from Task 3.
- Produces: JSON-LD block of `@type: "CafeOrCoffeeShop"` — later tasks (none) do not depend on this, but it is validated by Google's Rich Results Test as a manual launch-checklist step (see README, Task 8).

- [ ] **Step 1: Write the failing test (append to existing file)**

```javascript
// Add to test/index-content.test.js, after the phone number test:

test('GET / includes menu highlights linking to /menu', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /Full English Breakfast/);
  assert.match(body, /£9\.50/);
  assert.match(body, /href="\/menu"/);
});

test('GET / includes the reviews section with rating badge and Google link', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /4\.9★/);
  assert.match(body, /Read our reviews on Google/);
});

test('GET / includes the find-us section with address, map, and phone', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA/);
  assert.match(body, /<iframe/);
  assert.match(body, /id="find-us"/);
});

test('GET / footer has character-identical NAP', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /class="site-footer"/);
  assert.match(body, /Dennie's Cafe/);
  assert.match(body, /7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA/);
  assert.match(body, /01403 900317/);
});

test('GET / has valid CafeOrCoffeeShop JSON-LD schema', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  const match = body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'JSON-LD script tag not found');
  const schema = JSON.parse(match[1]);
  assert.strictEqual(schema['@type'], 'CafeOrCoffeeShop');
  assert.strictEqual(schema.name, "Dennie's Cafe");
  assert.strictEqual(schema.telephone, '+441403900317');
  assert.strictEqual(schema.address.postalCode, 'RH13 8DA');
  assert.strictEqual(schema.hasMenu, 'https://denniescafe.co.uk/menu');
  assert.strictEqual(schema.openingHoursSpecification.length, 2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/index-content.test.js`
Expected: FAIL — 5 new failures, sections/schema don't exist yet

- [ ] **Step 3: Add the JSON-LD block to `<head>`, and the new sections before `</body>`**

Insert into `<head>`, just before `</head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "Dennie's Cafe",
  "image": "https://denniescafe.co.uk/images/hero.svg",
  "url": "https://denniescafe.co.uk/",
  "telephone": "+441403900317",
  "priceRange": "£",
  "servesCuisine": "Café",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "7a Elm Grove, Station Road",
    "addressLocality": "Cowfold",
    "addressRegion": "West Sussex",
    "postalCode": "RH13 8DA",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 50.9989,
    "longitude": -0.2781
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:30",
      "closes": "15:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "08:30",
      "closes": "14:30"
    }
  ],
  "hasMenu": "https://denniescafe.co.uk/menu"
}
</script>
```

> **Note for launch checklist:** the `geo` coordinates above are the approximate Cowfold village centre, not a verified pin for 7a Elm Grove. Before launch, get exact coordinates by opening Google Maps, right-clicking the exact address pin, and copying the lat/long shown — then update these two numbers.

Insert into `<body>`, immediately before `</body>` (after the `about` section from Task 5):

```html
<section class="section">
  <h2>Menu Highlights</h2>
  <div class="menu-highlights">
    <div class="menu-card"><span>Full English Breakfast</span><span>£9.50</span></div>
    <div class="menu-card"><span>Bacon Sandwich</span><span>£5.25</span></div>
    <div class="menu-card"><span>Latte</span><span>£3.25 / £3.50</span></div>
    <div class="menu-card"><span>Cake (slice)</span><span>£3.50</span></div>
  </div>
  <p><a href="/menu" class="btn btn--primary">See the full menu</a></p>
</section>

<section id="reviews" class="section reviews">
  <h2>Reviews</h2>
  <p class="rating-badge">4.9★ — Rated by our customers on Google</p>
  <!-- TODO(keiron): replace these three quotes with real Google review quotes he picks. Do not invent quotes. -->
  <blockquote class="review-card">[Real Google review quote pending — Keiron to select]</blockquote>
  <blockquote class="review-card">[Real Google review quote pending — Keiron to select]</blockquote>
  <blockquote class="review-card">[Real Google review quote pending — Keiron to select]</blockquote>
  <p><a href="https://www.google.com/search?q=Dennie%27s+Cafe+Cowfold+reviews" target="_blank" rel="noopener">Read our reviews on Google</a></p>
  <!-- TODO(keiron): swap the link above for the direct Google Business Profile review link if available, and add the same QR/short link used on the till card here so site and till card match. -->
</section>

<section id="find-us" class="section find-us">
  <h2>Find Us</h2>
  <p>7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA</p>
  <p><a href="tel:+441403900317">01403 900317</a></p>
  <!-- TODO(keiron): confirm parking/one-line directions before launch — do not guess. -->
  <p>[Parking / directions from the A272 pending — Keiron to confirm]</p>
  <div class="map-embed">
    <iframe src="https://maps.google.com/maps?q=7a+Elm+Grove,+Station+Road,+Cowfold,+Horsham+RH13+8DA&output=embed" loading="lazy" title="Map showing Dennie's Cafe, Cowfold"></iframe>
  </div>
</section>

<footer class="site-footer">
  <p>Dennie's Cafe · 7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA · 01403 900317</p>
</footer>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/index-content.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add public/index.html test/index-content.test.js
git commit -m "Add menu highlights, reviews, find-us, footer, and CafeOrCoffeeShop schema"
```

---

### Task 7: menu.html — full menu page

**Files:**
- Create: `public/menu.html`
- Test: `test/menu-content.test.js`

**Interfaces:**
- Consumes: `.menu-table`, `.nav*`, `.site-footer` classes from Task 3. Served at `/menu` via the explicit route in `server.js` (Task 1).

- [ ] **Step 1: Write the failing test**

```javascript
// test/menu-content.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../server.js');

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => {
  server.close();
});

test('GET /menu returns 200 with correct title', async () => {
  const res = await fetch(`${baseUrl}/menu`);
  assert.strictEqual(res.status, 200);
  const body = await res.text();
  assert.match(body, /<title>Menu \| Dennie's Cafe Cowfold<\/title>/);
});

test('GET /menu lists confirmed prices', async () => {
  const res = await fetch(`${baseUrl}/menu`);
  const body = await res.text();
  assert.match(body, /Latte[\s\S]*?£3\.25 \/ £3\.50/);
  assert.match(body, /Full English breakfast[\s\S]*?£9\.50/);
  assert.match(body, /Bacon sandwich[\s\S]*?£5\.25/);
  assert.match(body, /Soya milk[\s\S]*?\+£1\.00/);
});

test('GET /menu has fresh-made and daily specials lines', async () => {
  const res = await fetch(`${baseUrl}/menu`);
  const body = await res.text();
  assert.match(body, /Everything made fresh to order\. Eat in or take away\./);
  assert.match(body, /Daily specials — ask when you visit\./);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/menu-content.test.js`
Expected: FAIL — 404, `public/menu.html` doesn't exist

- [ ] **Step 3: Write menu.html**

```html
<!-- public/menu.html -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Menu | Dennie's Cafe Cowfold</title>
<meta name="description" content="Full menu for Dennie's Cafe, Cowfold — hot drinks, breakfasts, sandwiches, cakes and more. Eat in or take away.">
<link rel="canonical" href="https://denniescafe.co.uk/menu">
<link rel="stylesheet" href="/css/styles.css">
</head>
<body>

<header class="site-header">
  <nav class="nav">
    <a href="/" class="nav__brand">Dennie's Cafe</a>
    <ul class="nav__links">
      <li><a href="/#about">About</a></li>
      <li><a href="/menu">Menu</a></li>
      <li><a href="/#reviews">Reviews</a></li>
      <li><a href="/#find-us">Find Us</a></li>
    </ul>
    <a href="tel:+441403900317" class="nav__call">Call 01403 900317</a>
  </nav>
</header>

<section class="section">
  <h1>Menu</h1>
  <p>Everything made fresh to order. Eat in or take away.</p>
  <p>Daily specials — ask when you visit.</p>

  <h2>Hot &amp; Cold Drinks</h2>
  <table class="menu-table">
    <tr><th>Item</th><th>Price</th></tr>
    <tr><td>Latte (regular / large)</td><td>£3.25 / £3.50</td></tr>
    <tr><td>Cappuccino (regular / large)</td><td>£3.25 / £3.50</td></tr>
    <tr><td>Flat white (regular / large)</td><td>£3.25 / £3.50</td></tr>
    <tr><td>Americano (large)</td><td>£3.15</td></tr>
    <tr><td>Tea (pot)</td><td>£3.50</td></tr>
    <tr><td>Hot chocolate</td><td>£3.95</td></tr>
    <tr><td>Milkshakes</td><td>£3.95 / £4.95 fully loaded</td></tr>
    <tr><td>Soft drinks / Ribena / energy drinks</td><td>£1.00–£2.00</td></tr>
    <tr><td>Soya milk</td><td>+£1.00</td></tr>
  </table>

  <h2>Breakfast &amp; Sandwiches</h2>
  <table class="menu-table">
    <tr><th>Item</th><th>Price</th></tr>
    <tr><td>Full English breakfast</td><td>£9.50</td></tr>
    <tr><td>Bacon sandwich</td><td>£5.25</td></tr>
    <tr><td>Sausage sandwich</td><td>£5.25</td></tr>
    <tr><td>Freshly made sandwiches</td><td>£5.50</td></tr>
    <tr><td>Toastie</td><td>£5.75</td></tr>
  </table>

  <h2>Cakes &amp; Sweets</h2>
  <table class="menu-table">
    <tr><th>Item</th><th>Price</th></tr>
    <tr><td>Flapjack / Millionaire shortbread</td><td>£3.50</td></tr>
    <tr><td>Cake (slice)</td><td>£3.50</td></tr>
    <tr><td>Tiffin</td><td>£3.75</td></tr>
  </table>

  <!-- TODO(keiron): confirm the rest of the menu he wants listed during the build session — this covers everything priced in the spec so far, but he may have more items (specials, extras) to add. -->
</section>

<footer class="site-footer">
  <p>Dennie's Cafe · 7a Elm Grove, Station Road, Cowfold, Horsham RH13 8DA · 01403 900317</p>
</footer>

</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/menu-content.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: All tests across all files PASS.

- [ ] **Step 6: Commit**

```bash
git add public/menu.html test/menu-content.test.js
git commit -m "Add full menu page"
```

---

### Task 8: README and deployment checklist

**Files:**
- Create: `README.md`

**Interfaces:**
- None — this is documentation only, no code or tests. Verification is manual (a human follows the steps).

- [ ] **Step 1: Write README.md**

```markdown
# Dennie's Cafe Website

Static brochure site for Dennie's Cafe, Cowfold — Node/Express serving `public/`.

## Local development

\`\`\`bash
npm install
npm start        # serves on http://localhost:3000
npm test         # runs the test suite (node --test)
\`\`\`

## Open items before launch (do not skip — see design spec)

- [ ] Get the real one-line origin story from Keiron, replace the placeholder in `public/index.html` (About section).
- [ ] Get 3 real Google review quotes from Keiron, replace the three placeholder `<blockquote>` entries in `public/index.html` (Reviews section). Never invent quotes.
- [ ] Get parking/directions line from Keiron, replace the placeholder in `public/index.html` (Find Us section).
- [ ] Get exact geo coordinates for 7a Elm Grove, Station Road, Cowfold RH13 8DA from Google Maps (right-click the pin, copy lat/long) and update the JSON-LD `geo` block in `public/index.html`.
- [ ] Get the till-card QR/short link from Keiron and add it next to the Google reviews link.
- [ ] Confirm the rest of the menu Keiron wants listed (specials, extras beyond what's in `public/menu.html`).
- [ ] Replace placeholder SVGs in `public/images/` with real compressed photos (WebP/JPEG, max ~1600px wide) once Keiron supplies them, and update the matching `<img src>` in `public/index.html`.
- [ ] Pull the live Google review count, or keep the "Rated 4.9★ by our customers on Google" wording to avoid a stale number.

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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add README with local dev and deployment checklist"
```

---

## Self-Review Notes

- **Spec coverage:** stack (Task 1), site structure `/` `/menu` `/robots.txt` `/sitemap.xml` (Tasks 1–2, 5–7), NAP/hours/phone (Tasks 5–6), hero (Task 5), menu highlights + full menu with confirmed prices (Tasks 6–7), reviews section incl. Google link (Task 6), find us + map (Task 6), photo placeholder slots (Task 4), SEO title/meta/schema/sitemap/robots (Tasks 2, 5–6), NAP consistency (footer + schema in Task 6), out-of-scope items (correctly absent from every task), launch checklist (Task 8 README).
- **Placeholder scan:** all `TODO(keiron)` markers are intentional, spec-mandated data-collection items (origin story, review quotes, directions, exact geo, till-card link, extra menu items, real photos) — each is visible in the rendered page/README rather than silently blank, and none of them block the build or deploy.
- **Type/name consistency checked:** `app` export from `server.js` used identically across all five test files; CSS class names introduced in Task 3 match exactly what's used in Tasks 5–7 (`nav__call`, `hero__cta`, `menu-card`, `review-card`, `map-embed`, `site-footer`, `menu-table`, etc.).
