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
