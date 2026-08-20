/**
 * CRUX by UTCRUX — Cloudflare Worker Public API (D1 Database Integration)
 * Cost: $0 / ₹0 (Cloudflare Workers Free Tier)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // 1. Health Check
      if (path === '/health' && method === 'GET') {
        return jsonResponse({
          status: 'OK',
          service: 'CRUX-Cloudflare-Worker-API',
          env: env.ENVIRONMENT || 'production',
          timestamp: new Date().toISOString()
        });
      }

      // 2. Public Content API — GET /content/feed
      if (path === '/content/feed' && method === 'GET') {
        const limitParam = parseInt(url.searchParams.get('limit') || '20', 10);
        const now = new Date().toISOString();

        const query = `
          SELECT * FROM crux_content 
          WHERE status = 'PUBLISHED' 
            AND (visibility IS NULL OR visibility = 'PUBLIC')
            AND (expires_at IS NULL OR expires_at > ?)
            AND (published_at IS NULL OR published_at <= ?)
          ORDER BY priority DESC, published_at DESC 
          LIMIT ?
        `;

        const { results } = await env.DB.prepare(query).bind(now, now, limitParam).all();
        return jsonResponse(results || []);
      }

      // 3. Public Content API — GET /content/latest
      if (path === '/content/latest' && method === 'GET') {
        const now = new Date().toISOString();
        const query = `
          SELECT * FROM crux_content 
          WHERE status = 'PUBLISHED' 
            AND (visibility IS NULL OR visibility = 'PUBLIC')
            AND (expires_at IS NULL OR expires_at > ?)
            AND (published_at IS NULL OR published_at <= ?)
          ORDER BY priority DESC, published_at DESC 
          LIMIT 1
        `;

        const result = await env.DB.prepare(query).bind(now, now).first();
        if (!result) {
          return jsonResponse({ error: 'No published content available' }, 404);
        }
        return jsonResponse(result);
      }

      // 4. Public Content API — GET /content/:id
      if (path.startsWith('/content/') && !path.startsWith('/content/category/') && method === 'GET') {
        const id = path.replace('/content/', '');
        const query = `SELECT * FROM crux_content WHERE id = ?`;
        const result = await env.DB.prepare(query).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Content item not found' }, 404);
        }
        return jsonResponse(result);
      }

      // 5. Public Content API — GET /content/category/:category
      if (path.startsWith('/content/category/') && method === 'GET') {
        const category = path.replace('/content/category/', '');
        const query = `
          SELECT * FROM crux_content 
          WHERE category = ? AND status = 'PUBLISHED'
          ORDER BY priority DESC, published_at DESC
        `;
        const { results } = await env.DB.prepare(query).bind(category).all();
        return jsonResponse(results || []);
      }

      // 6. Admin Authentication — POST /admin/login
      if (path === '/admin/login' && method === 'POST') {
        const body = await request.json();
        const adminPass = env.ADMIN_PASSWORD || 'cruxadmin2026';
        if (body.username === 'admin' && body.password === adminPass) {
          return jsonResponse({
            message: 'Authentication successful',
            token: 'worker_jwt_token_crux_2026'
          });
        }
        return jsonResponse({ error: 'Invalid admin credentials' }, 401);
      }

      // 7. Admin Content Creation — POST /admin/content
      if (path === '/admin/content' && method === 'POST') {
        const body = await request.json();
        const id = body.id || `crux_${Date.now()}`;
        const now = new Date().toISOString();

        const insertQuery = `
          INSERT INTO crux_content (
            id, type, title, body, short_text, author, category, image_url,
            visibility, status, priority, published_at, scheduled_at, created_at,
            updated_at, expires_at, question, options, correct_answer, explanation,
            difficulty, points
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `;

        await env.DB.prepare(insertQuery).bind(
          id,
          body.type || 'CRUX',
          body.title || 'UNTITLED',
          body.body || '',
          body.short_text || body.body || '',
          body.author || 'UTCRUX',
          body.category || 'GENERAL',
          body.image_url || '',
          body.visibility || 'PUBLIC',
          body.status || 'PUBLISHED',
          body.priority !== undefined ? body.priority : 10,
          body.published_at || now,
          body.scheduled_at || now,
          now,
          now,
          body.expires_at || null,
          body.question || null,
          body.options || null,
          body.correct_answer || null,
          body.explanation || null,
          body.difficulty || 'EASY',
          body.points || 10
        ).run();

        return jsonResponse({
          message: 'Content published to Cloudflare D1 successfully',
          data: { id, type: body.type, title: body.title }
        }, 201);
      }

      // 8. Admin Content Deletion — DELETE /admin/content/:id
      if (path.startsWith('/admin/content/') && method === 'DELETE') {
        const id = path.replace('/admin/content/', '');
        await env.DB.prepare(`DELETE FROM crux_content WHERE id = ?`).bind(id).run();
        return jsonResponse({ message: 'Content deleted successfully', id });
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404);

    } catch (err) {
      return jsonResponse({ error: 'Internal Worker Server Error', details: err.message }, 500);
    }
  }
};
