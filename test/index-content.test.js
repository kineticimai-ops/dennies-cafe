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

test('GET / includes the gallery images with lazy loading', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.match(body, /\/images\/interior\.webp/);
  assert.match(body, /\/images\/counter\.webp/);
  assert.match(body, /\/images\/food-1\.webp/);
  assert.match(body, /\/images\/coffee\.webp/);
  assert.match(body, /\/images\/outdoor-seating\.webp/);
  assert.match(body, /\/images\/upstairs\.webp/);
  assert.match(body, /\/images\/pavement-sign\.webp/);
  assert.match(body, /loading="lazy"/);
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
