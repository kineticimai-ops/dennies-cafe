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
  assert.match(body, /\.find-us/);
});
