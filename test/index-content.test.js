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
