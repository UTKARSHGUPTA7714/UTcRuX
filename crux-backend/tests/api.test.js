const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');

let server;
let baseUrl;
let adminToken = '';
let testCreatedId = '';

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Helper request wrapper
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const reqOptions = {
    method: options.method || 'GET',
    headers
  };

  return new Promise((resolve, reject) => {
    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

describe('CRUX Automated API Test Suite', () => {

  test('1. Health Check Endpoint', async () => {
    const res = await request('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  test('2. Admin Login - Failure with Bad Password', async () => {
    const res = await request('/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'wrongpassword' }
    });
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
  });

  test('3. Admin Login - Success & JWT Token Generation', async () => {
    const res = await request('/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'cruxadmin2026' }
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    adminToken = res.body.token;
  });

  test('4. Unauthorized Request without Token', async () => {
    const res = await request('/admin/content');
    assert.equal(res.status, 401);
  });

  test('5. Invalid Input Validation on Create Content', async () => {
    const res = await request('/admin/content', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { title: '' } // missing body
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test('6. Create Content (CRUX #001) as Admin', async () => {
    const res = await request('/admin/content', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        type: 'CRUX',
        title: "Tomorrow's classes will be online.",
        body: 'Due to severe weather warnings, all campus lectures will transition online tomorrow.',
        short_text: 'Tomorrow classes online.',
        category: 'Campus',
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        priority: 1
      }
    });
    assert.equal(res.status, 201);
    assert.ok(res.body.data.id);
    testCreatedId = res.body.data.id;
  });

  test('7. Public Feed Endpoint Returns Created Item', async () => {
    const res = await request('/content/feed');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    const found = res.body.find(i => i.id === testCreatedId);
    assert.ok(found);
    assert.equal(found.title, "Tomorrow's classes will be online.");
  });

  test('8. Latest Content Endpoint Returns Top Priority Item', async () => {
    const res = await request('/content/latest');
    assert.equal(res.status, 200);
    assert.ok(res.body.id);
    assert.ok(res.body.title);
  });

  test('9. Update Content Item as Admin', async () => {
    const res = await request(`/admin/content/${testCreatedId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: "Tomorrow's classes will be online (UPDATED).",
        body: 'Updated details for campus online classes.'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, "Tomorrow's classes will be online (UPDATED).");
  });

  test('10. Delete Content Item as Admin', async () => {
    const res = await request(`/admin/content/${testCreatedId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Content deleted successfully');
  });

  test('11. Expired Content Filtering', async () => {
    // Create an expired item
    const expiredRes = await request('/admin/content', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'EXPIRED NOTICE',
        body: 'This notice has expired.',
        status: 'PUBLISHED',
        expires_at: '2020-01-01T00:00:00Z'
      }
    });
    const expiredId = expiredRes.body.data.id;

    // Verify it is NOT returned in public feed
    const feedRes = await request('/content/feed');
    const inFeed = feedRes.body.find(i => i.id === expiredId);
    assert.equal(inFeed, undefined);

    // Clean up
    await request(`/admin/content/${expiredId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
  });

});
