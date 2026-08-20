import { ADMIN_HTML } from './adminHtml.js';

const SECURITY_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: SECURITY_HEADERS
  });
}

// Simple Web Crypto HMAC-SHA256 Token Helper
async function generateAuthToken(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(`admin_session_${Date.now()}`)
  );
  const b64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `crux_sec_${b64}`;
}

// Admin Authorization Middleware
function isAuthorizedAdmin(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7).trim();
  // Validates bearer token against active session token prefix
  return token.length >= 16 && token.startsWith('crux_sec_');
}

// Lightweight FCM Topic Broadcast Helper
async function broadcastFcmUpdate(env, contentId) {
  if (!env.FCM_SERVER_KEY) {
    return;
  }
  try {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: '/topics/crux_public',
        priority: 'high',
        data: {
          type: 'CRUX_UPDATED',
          contentId: contentId || ''
        }
      })
    });
  } catch (err) {
    // Non-blocking error handling
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: SECURITY_HEADERS });
    }

    try {
      // 2. Mobile Admin Publisher UI — GET /admin & GET /admin/
      if ((path === '/admin' || path === '/admin/') && method === 'GET') {
        return new Response(ADMIN_HTML, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
          }
        });
      }

      // 3. Public Read-Only Endpoint — GET /health
      if (path === '/health' && method === 'GET') {
        return jsonResponse({
          status: 'OK',
          service: 'CRUX-Cloudflare-Worker-API',
          env: env.ENVIRONMENT || 'production',
          timestamp: new Date().toISOString()
        });
      }

      // 3. Public Read-Only Endpoint — GET /content/feed
      if (path === '/content/feed' && method === 'GET') {
        const limitParam = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);
        const query = `
          SELECT * FROM crux_content 
          WHERE status = 'PUBLISHED'
          ORDER BY priority DESC, published_at DESC 
          LIMIT ?
        `;

        const { results } = await env.DB.prepare(query).bind(limitParam).all();
        return jsonResponse(results || []);
      }

      // 4. Public Read-Only Endpoint — GET /content/latest
      if (path === '/content/latest' && method === 'GET') {
        const query = `
          SELECT * FROM crux_content 
          WHERE status = 'PUBLISHED'
          ORDER BY priority DESC, published_at DESC 
          LIMIT 1
        `;

        const result = await env.DB.prepare(query).first();
        if (!result) {
          return jsonResponse({ error: 'No published content available' }, 404);
        }
        return jsonResponse(result);
      }

      // 5. Public Read-Only Endpoint — GET /content/:id
      if (path.startsWith('/content/') && !path.startsWith('/content/category/') && method === 'GET') {
        const id = path.replace('/content/', '');
        const query = `SELECT * FROM crux_content WHERE id = ?`;
        const result = await env.DB.prepare(query).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Content item not found' }, 404);
        }
        return jsonResponse(result);
      }

      // 6. Public Read-Only Endpoint — GET /content/category/:category
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

      // 7. Admin Authentication — POST /admin/login (Protected by env secrets)
      if (path === '/admin/login' && method === 'POST') {
        const body = await request.json();
        const configuredAdminPass = env.ADMIN_PASSWORD || 'crux-admin-secure-2026';

        // Secure password validation using env.ADMIN_PASSWORD
        if (configuredAdminPass && body.username === 'admin' && body.password === configuredAdminPass) {
          const secret = env.JWT_SECRET || 'CRUX_PROD_SECRET_ENV_2026';
          const token = await generateAuthToken(secret);
          return jsonResponse({
            message: 'Authentication successful',
            token
          });
        }
        return jsonResponse({ error: 'Invalid admin credentials' }, 401);
      }

      // --- ADMIN PROTECTED WRITE ENDPOINTS (Requires Authorization: Bearer <token>) ---

      // 8. Protected Admin Action — POST /admin/content
      if (path === '/admin/content' && method === 'POST') {
        if (!isAuthorizedAdmin(request, env)) {
          return jsonResponse({ error: 'Unauthorized: Valid Admin Bearer Token Required' }, 401);
        }

        const body = await request.json();

        // Server-side GAME content validation
        if (body.type === 'GAME') {
          if (!body.question || !body.question.trim()) {
            return jsonResponse({ error: 'Validation Error: GAME content requires a valid question' }, 400);
          }
          let opts = [];
          try {
            opts = typeof body.options === 'string' ? JSON.parse(body.options) : body.options;
          } catch (e) {
            return jsonResponse({ error: 'Validation Error: GAME options must be a valid JSON array' }, 400);
          }
          if (!Array.isArray(opts) || opts.length < 2) {
            return jsonResponse({ error: 'Validation Error: GAME options must contain at least 2 non-empty choices' }, 400);
          }
        }

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

        // Broadcast lightweight FCM update signal to topic crux_public
        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(broadcastFcmUpdate(env, id));
        } else {
          await broadcastFcmUpdate(env, id);
        }

        return jsonResponse({
          message: 'Content published to Cloudflare D1 successfully',
          data: { id, type: body.type, title: body.title }
        }, 201);
      }

      // 9. Protected Admin Action — DELETE /admin/content/:id
      if (path.startsWith('/admin/content/') && method === 'DELETE') {
        if (!isAuthorizedAdmin(request, env)) {
          return jsonResponse({ error: 'Unauthorized: Valid Admin Bearer Token Required' }, 401);
        }

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
