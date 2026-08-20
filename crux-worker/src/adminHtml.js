/**
 * Mobile-First CRUX Admin Studio HTML Template
 * Served directly by Cloudflare Worker at GET /admin
 */

export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>UTcRuX — Mobile Admin Publisher</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0A0A0C;
      --bg-surface: #141418;
      --bg-card: #1C1C22;
      --border-color: #2D2D36;
      --text-main: #F0F0F5;
      --text-muted: #8E8E9F;
      --accent-red: #D00000;
      --accent-orange: #FF9800;
      --accent-green: #00E676;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 20px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }

    body {
      background-color: var(--bg-primary);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding-bottom: 40px;
    }

    header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 16px 20px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-title {
      font-weight: 800;
      font-size: 18px;
      color: var(--accent-red);
      letter-spacing: -0.5px;
    }

    .brand-tag {
      font-size: 10px;
      font-weight: 700;
      background: rgba(208, 0, 0, 0.15);
      color: var(--accent-red);
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .auth-btn {
      background: #22222C;
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      min-height: 38px;
    }

    .container {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 20px;
    }

    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    input, select, textarea {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      font-size: 15px;
      min-height: 48px;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-orange);
    }

    textarea { resize: vertical; min-height: 100px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .btn-action {
      width: 100%;
      min-height: 52px;
      background: var(--accent-red);
      color: #FFF;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(208, 0, 0, 0.3);
    }

    .btn-action:active { transform: scale(0.98); }

    /* Widget Live Preview */
    .widget-preview {
      background: #080808;
      border: 2px solid #222;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    }

    .w-brand { font-size: 10px; font-weight: 700; color: var(--accent-red); margin-bottom: 6px; }
    .w-title { font-size: 17px; font-weight: 700; color: #FFF; margin-bottom: 8px; line-height: 1.3; }
    .w-body { font-size: 13px; color: #CCC; line-height: 1.4; margin-bottom: 12px; }
    
    .w-mcq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .w-mcq-opt { background: #161616; border: 1px solid #333; color: #DDD; padding: 8px; font-size: 11px; text-align: center; border-radius: 6px; font-weight: 600; }
    
    .w-footer { display: flex; justify-content: space-between; font-size: 9px; color: #777; border-top: 1px solid #1A1A1A; padding-top: 8px; }

    .alert {
      padding: 14px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      display: none;
      line-height: 1.4;
    }
    .alert-success { background: rgba(0, 230, 118, 0.15); border: 1px solid rgba(0, 230, 118, 0.3); color: var(--accent-green); }
    .alert-error { background: rgba(208, 0, 0, 0.15); border: 1px solid rgba(208, 0, 0, 0.3); color: #FF5252; }

    /* Login Overlay */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 1000;
    }
    .modal {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 24px;
      width: 100%;
      max-width: 380px;
    }

    /* Content Cards Feed */
    .feed-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .feed-info { display: flex; flex-direction: column; gap: 4px; }
    .feed-title { font-size: 13px; font-weight: 700; color: #FFF; }
    .feed-meta { font-size: 10px; color: var(--text-muted); }
    
    .btn-delete {
      background: rgba(208, 0, 0, 0.15);
      color: #FF5252;
      border: 1px solid rgba(208, 0, 0, 0.3);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <span class="brand-title">UTcRuX</span>
      <span class="brand-tag">MOBILE ADMIN</span>
    </div>
    <button id="authBtn" class="auth-btn" onclick="openLoginModal()">Authenticate</button>
  </header>

  <div class="container">
    <div id="alertBox" class="alert"></div>

    <!-- Publisher Form -->
    <div class="card">
      <div class="card-title">
        <span>Publish Daily Content</span>
        <span style="color: var(--accent-green); font-size: 10px;" id="authStatusText">UNAUTHENTICATED</span>
      </div>

      <form id="publishForm" onsubmit="handlePublish(event)">
        <div class="grid-2">
          <div class="form-group">
            <label for="contentType">Type</label>
            <select id="contentType" onchange="toggleFields()">
              <option value="CRUX">CRUX (Standard)</option>
              <option value="QUOTE">QUOTE</option>
              <option value="FACT">FACT</option>
              <option value="QUESTION">QUESTION</option>
              <option value="GAME">GAME (MCQ)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="category">Category</label>
            <input type="text" id="category" value="GENERAL">
          </div>
        </div>

        <div class="form-group">
          <label for="title">Title / Headline</label>
          <input type="text" id="title" required placeholder="e.g. CRUX PHONE TEST #001" oninput="updatePreview()">
        </div>

        <div class="form-group" id="bodyGroup">
          <label for="body">Content Body</label>
          <textarea id="body" placeholder="Write concise update..." oninput="updatePreview()"></textarea>
        </div>

        <!-- GAME Specific Form -->
        <div id="gameFields" style="display: none; border-top: 1px dashed var(--border-color); padding-top: 12px; margin-top: 12px;">
          <div class="form-group">
            <label for="gameQuestion">MCQ Question</label>
            <input type="text" id="gameQuestion" placeholder="e.g. 5 + 5 × 2 = ?" oninput="updatePreview()">
          </div>
          <div class="grid-2">
            <div class="form-group"><label for="optA">Opt A</label><input type="text" id="optA" placeholder="15" oninput="updatePreview()"></div>
            <div class="form-group"><label for="optB">Opt B</label><input type="text" id="optB" placeholder="20" oninput="updatePreview()"></div>
            <div class="form-group"><label for="optC">Opt C</label><input type="text" id="optC" placeholder="25" oninput="updatePreview()"></div>
            <div class="form-group"><label for="optD">Opt D</label><input type="text" id="optD" placeholder="10" oninput="updatePreview()"></div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label for="correctOpt">Correct Answer</label>
              <select id="correctOpt">
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div class="form-group">
              <label for="points">Points</label>
              <input type="number" id="points" value="10">
            </div>
          </div>
          <div class="form-group">
            <label for="explanation">Explanation</label>
            <input type="text" id="explanation" placeholder="Multiplication has higher precedence than addition.">
          </div>
        </div>

        <div class="form-group">
          <label for="priority">Priority (1–10)</label>
          <input type="number" id="priority" value="10" min="1" max="10">
        </div>

        <button type="submit" class="btn-action">
          <span>🚀</span>
          <span>PUBLISH TO ALL DEVICES</span>
        </button>
      </form>
    </div>

    <!-- Live Preview Card -->
    <div class="card">
      <div class="card-title">Home-Screen Widget Preview</div>
      <div class="widget-preview">
        <div class="w-brand">UTcRuX</div>
        <div class="w-title" id="prevTitle">CRUX PHONE TEST #001</div>
        <div class="w-body" id="prevBody">Published directly from the CRUX mobile Admin Studio.</div>
        
        <div class="w-mcq-grid" id="prevMcqGrid" style="display: none;">
          <div class="w-mcq-opt" id="prevOptA">[ A ]</div>
          <div class="w-mcq-opt" id="prevOptB">[ B ]</div>
          <div class="w-mcq-opt" id="prevOptC">[ C ]</div>
          <div class="w-mcq-opt" id="prevOptD">[ D ]</div>
        </div>

        <div class="w-footer">
          <span id="prevTime">JUST NOW</span>
          <span>▶ &nbsp; ‹ 01/01 ›</span>
        </div>
      </div>
    </div>

    <!-- Feed Management -->
    <div class="card">
      <div class="card-title">
        <span>Recent CRUX Feed</span>
        <button class="auth-btn" style="padding: 4px 8px; font-size: 10px;" onclick="loadFeed()">Refresh</button>
      </div>
      <div id="feedContainer">
        <div style="color: var(--text-muted); font-size: 12px; text-align: center;">Loading feed...</div>
      </div>
    </div>
  </div>

  <!-- Login Modal -->
  <div id="loginModal" class="modal-overlay" style="display: none;">
    <div class="modal">
      <h3 style="font-size: 16px; margin-bottom: 16px;">Admin Authentication</h3>
      <div class="form-group">
        <label for="adminUser">Username</label>
        <input type="text" id="adminUser" value="admin">
      </div>
      <div class="form-group">
        <label for="adminPass">Password</label>
        <input type="password" id="adminPass" placeholder="Enter password...">
      </div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button class="auth-btn" style="flex: 1;" onclick="closeLoginModal()">Cancel</button>
        <button class="auth-btn" style="flex: 1; background: var(--accent-red); border-color: var(--accent-red);" onclick="performLogin()">Login</button>
      </div>
    </div>
  </div>

  <script>
    let authToken = sessionStorage.getItem('crux_token') || null;

    document.addEventListener('DOMContentLoaded', () => {
      checkAuth();
      loadFeed();
      updatePreview();
    });

    function checkAuth() {
      const authBtn = document.getElementById('authBtn');
      const statusText = document.getElementById('authStatusText');
      if (authToken) {
        authBtn.textContent = 'Logout';
        authBtn.onclick = logout;
        statusText.textContent = 'AUTHENTICATED';
        statusText.style.color = 'var(--accent-green)';
      } else {
        authBtn.textContent = 'Authenticate';
        authBtn.onclick = openLoginModal;
        statusText.textContent = 'LOCKED';
        statusText.style.color = '#FF5252';
      }
    }

    function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }
    function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }

    async function performLogin() {
      const username = document.getElementById('adminUser').value;
      const password = document.getElementById('adminPass').value;
      try {
        const res = await fetch('/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          authToken = data.token;
          sessionStorage.setItem('crux_token', authToken);
          checkAuth();
          closeLoginModal();
          showAlert('✓ Admin login successful', 'success');
        } else {
          alert('Login failed: ' + (data.error || 'Invalid password'));
        }
      } catch (e) {
        alert('Network error: ' + e.message);
      }
    }

    function logout() {
      authToken = null;
      sessionStorage.removeItem('crux_token');
      checkAuth();
      showAlert('Logged out successfully', 'success');
    }

    function toggleFields() {
      const type = document.getElementById('contentType').value;
      const gameFields = document.getElementById('gameFields');
      const bodyGroup = document.getElementById('bodyGroup');
      if (type === 'GAME') {
        gameFields.style.display = 'block';
        bodyGroup.style.display = 'none';
      } else {
        gameFields.style.display = 'none';
        bodyGroup.style.display = 'block';
      }
      updatePreview();
    }

    function updatePreview() {
      const type = document.getElementById('contentType').value;
      const title = document.getElementById('title').value || 'CRUX PHONE TEST #001';
      const body = document.getElementById('body').value || 'Published directly from the CRUX mobile Admin Studio.';
      const question = document.getElementById('gameQuestion').value || '5 + 5 × 2 = ?';

      document.getElementById('prevTitle').textContent = title;

      if (type === 'GAME') {
        document.getElementById('prevBody').textContent = question;
        document.getElementById('prevMcqGrid').style.display = 'grid';
        document.getElementById('prevOptA').textContent = '[ ' + (document.getElementById('optA').value || '15') + ' ]';
        document.getElementById('prevOptB').textContent = '[ ' + (document.getElementById('optB').value || '20') + ' ]';
        document.getElementById('prevOptC').textContent = '[ ' + (document.getElementById('optC').value || '25') + ' ]';
        document.getElementById('prevOptD').textContent = '[ ' + (document.getElementById('optD').value || '10') + ' ]';
      } else {
        document.getElementById('prevBody').textContent = body;
        document.getElementById('prevMcqGrid').style.display = 'none';
      }
    }

    async function handlePublish(e) {
      e.preventDefault();
      if (!authToken) {
        openLoginModal();
        return;
      }

      const type = document.getElementById('contentType').value;
      const title = document.getElementById('title').value;
      const category = document.getElementById('category').value;
      const priority = parseInt(document.getElementById('priority').value, 10);
      const now = new Date().toISOString();

      let payload = {
        id: \`crux_\${Date.now()}\`,
        type,
        title,
        category,
        priority,
        status: 'PUBLISHED',
        published_at: now
      };

      if (type === 'GAME') {
        const question = document.getElementById('gameQuestion').value;
        const optA = document.getElementById('optA').value;
        const optB = document.getElementById('optB').value;
        const optC = document.getElementById('optC').value;
        const optD = document.getElementById('optD').value;
        const correctKey = document.getElementById('correctOpt').value;

        const opts = [optA, optB, optC, optD].filter(o => o.trim() !== '');
        if (opts.length < 2) {
          showAlert('GAME content requires at least 2 non-empty options!', 'error');
          return;
        }

        let correctVal = optA;
        if (correctKey === 'B') correctVal = optB;
        if (correctKey === 'C') correctVal = optC;
        if (correctKey === 'D') correctVal = optD;

        payload.body = question;
        payload.question = question;
        payload.options = JSON.stringify(opts);
        payload.correct_answer = correctVal;
        payload.explanation = document.getElementById('explanation').value || null;
        payload.points = parseInt(document.getElementById('points').value, 10) || 10;
      } else {
        payload.body = document.getElementById('body').value || title;
      }

      try {
        const res = await fetch('/admin/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${authToken}\`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString([], { day: '2-digit', month: 'short' });
          showAlert(\`✓ CRUX PUBLISHED<br>Content ID: <strong>\${data.data.id}</strong><br>Published: \${timeStr}\`, 'success');
          document.getElementById('publishForm').reset();
          toggleFields();
          loadFeed();
        } else {
          showAlert('Publish Failed: ' + (data.error || 'Unauthorized'), 'error');
        }
      } catch (e) {
        showAlert('Error: ' + e.message, 'error');
      }
    }

    async function loadFeed() {
      try {
        const res = await fetch('/content/feed?limit=15');
        const data = await res.json();
        const container = document.getElementById('feedContainer');
        container.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
          data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'feed-card';
            const timeStr = item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            div.innerHTML = \`
              <div class="feed-info">
                <div class="feed-title">\${item.title}</div>
                <div class="feed-meta">\${item.type} • \${timeStr}</div>
              </div>
              <button class="btn-delete" onclick="deleteItem('\${item.id}')">Delete</button>
            \`;
            container.appendChild(div);
          });
        } else {
          container.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; text-align: center;">No published content found.</div>';
        }
      } catch (e) {
        console.error('Feed error:', e);
      }
    }

    async function deleteItem(id) {
      if (!authToken) {
        openLoginModal();
        return;
      }
      if (!confirm(\`Delete item \${id}?\`)) return;

      try {
        const res = await fetch(\`/admin/content/\${id}\`, {
          method: 'DELETE',
          headers: { 'Authorization': \`Bearer \${authToken}\` }
        });
        if (res.ok) {
          showAlert(\`✓ Deleted \${id}\`, 'success');
          loadFeed();
        } else {
          const data = await res.json();
          showAlert('Delete Failed: ' + (data.error || 'Unauthorized'), 'error');
        }
      } catch (e) {
        showAlert('Error: ' + e.message, 'error');
      }
    }

    function showAlert(msg, type) {
      const box = document.getElementById('alertBox');
      box.className = \`alert alert-\${type}\`;
      box.innerHTML = msg;
      box.style.display = 'block';
      setTimeout(() => { box.style.display = 'none'; }, 8000);
    }
  </script>
</body>
</html>`;
