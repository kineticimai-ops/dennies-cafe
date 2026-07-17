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
