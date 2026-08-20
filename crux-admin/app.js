// CRUX Admin Dashboard Engine
let authToken = localStorage.getItem('crux_admin_token') || null;
let allContent = [];

// DOM Elements
const authModal = document.getElementById('authModal');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const apiBaseUrlInput = document.getElementById('apiBaseUrl');

// Form & Live Preview Elements
const contentForm = document.getElementById('contentForm');
const contentType = document.getElementById('contentType');
const contentCategory = document.getElementById('contentCategory');
const contentTitle = document.getElementById('contentTitle');
const contentBody = document.getElementById('contentBody');
const contentShortText = document.getElementById('contentShortText');
const contentAuthor = document.getElementById('contentAuthor');
const contentPriority = document.getElementById('contentPriority');
const contentStatus = document.getElementById('contentStatus');
const scheduledAt = document.getElementById('scheduledAt');

// Widget Preview Elements
const prevTag = document.getElementById('prevTag');
const prevId = document.getElementById('prevId');
const prevTitle = document.getElementById('prevTitle');
const prevBody = document.getElementById('prevBody');
const prevTime = document.getElementById('prevTime');
const widgetPreviewBox = document.getElementById('widgetPreviewBox');

// Helper to get API Base URL
function getApiUrl() {
  return apiBaseUrlInput.value.replace(/\/+$/, '');
}

// Initializing Dashboard
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupFormListeners();
  setupWidgetPreviewSwitcher();

  if (authToken) {
    showApp();
    loadDashboardData();
  } else {
    showLogin();
  }
});

// Auth Handlers
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('hidden');

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${getApiUrl()}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      authToken = data.token;
      localStorage.setItem('crux_admin_token', authToken);
      showApp();
      loadDashboardData();
    } else {
      authError.textContent = data.error || 'Login failed';
      authError.classList.remove('hidden');
    }
  } catch (err) {
    authError.textContent = 'Cannot connect to backend server. Make sure node server is running.';
    authError.classList.remove('hidden');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  authToken = null;
  localStorage.removeItem('crux_admin_token');
  showLogin();
});

function showLogin() {
  authModal.classList.remove('hidden');
  appContainer.classList.add('hidden');
}

function showApp() {
  authModal.classList.add('hidden');
  appContainer.classList.remove('hidden');
}

// Navigation Tabs
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPages = document.querySelectorAll('.tab-page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      
      navItems.forEach(n => n.classList.remove('active'));
      tabPages.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetTab = document.getElementById(`tab-${tabName}`);
      if (targetTab) targetTab.classList.add('active');

      document.getElementById('pageTitle').textContent = tabName.toUpperCase();
    });
  });

  document.getElementById('refreshContentBtn').addEventListener('click', loadDashboardData);
  document.getElementById('searchInput').addEventListener('input', renderContentTable);
  document.getElementById('typeFilter').addEventListener('change', renderContentTable);
}

// Load Content from Backend
async function loadDashboardData() {
  try {
    const res = await fetch(`${getApiUrl()}/admin/content`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.status === 401) {
      authToken = null;
      localStorage.removeItem('crux_admin_token');
      showLogin();
      return;
    }

    allContent = await res.json();
    updateStats();
    renderContentTable();
    renderLatestItem();
    renderScheduledList();
  } catch (err) {
    console.error('Error fetching admin data:', err);
  }
}

// Update Overview Stats
function updateStats() {
  document.getElementById('statTotal').textContent = allContent.length;
  document.getElementById('statPublished').textContent = allContent.filter(i => i.status === 'PUBLISHED').length;
  document.getElementById('statScheduled').textContent = allContent.filter(i => i.status === 'SCHEDULED').length;
  document.getElementById('statDrafts').textContent = allContent.filter(i => i.status === 'DRAFT').length;
}

// Render Content Table
function renderContentTable() {
  const tbody = document.getElementById('contentTableBody');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const filter = document.getElementById('typeFilter').value;

  const filtered = allContent.filter(item => {
    if (filter !== 'ALL' && item.type !== filter) return false;
    if (search) {
      const matchTitle = item.title ? item.title.toLowerCase().includes(search) : false;
      const matchBody = item.body ? item.body.toLowerCase().includes(search) : false;
      const matchCategory = item.category ? item.category.toLowerCase().includes(search) : false;
      return matchTitle || matchBody || matchCategory;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;" class="mono">No matching content found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td><span class="type-tag">${item.type}</span></td>
      <td>
        <strong style="color:#fff;">${escapeHtml(item.title || '')}</strong>
        <div style="font-size:11px; color:#888; margin-top:4px;">${escapeHtml(item.body || '')}</div>
      </td>
      <td class="mono">${escapeHtml(item.category || 'General')}</td>
      <td><span style="font-weight:700; color: ${getStatusColor(item.status)}">${item.status}</span></td>
      <td class="mono">${item.priority !== undefined ? item.priority : 5}</td>
      <td class="mono" style="font-size:11px;">${formatDate(item.published_at)}</td>
      <td>
        <button class="btn btn-outline btn-small" onclick="editItem('${item.id}')">EDIT</button>
        <button class="btn btn-outline btn-small" onclick="deleteItem('${item.id}')" style="color:#d00000;">DEL</button>
      </td>
    </tr>
  `).join('');
}

function getStatusColor(status) {
  switch (status) {
    case 'PUBLISHED': return '#4caf50';
    case 'SCHEDULED': return '#ff9800';
    case 'DRAFT': return '#9e9e9e';
    default: return '#ffffff';
  }
}

// Render Latest Item Card
function renderLatestItem() {
  const container = document.getElementById('latestItemCard');
  const published = allContent.filter(i => i.status === 'PUBLISHED');
  if (published.length === 0) {
    container.innerHTML = `<div class="mono" style="color:#888;">No items currently published.</div>`;
    return;
  }

  const item = published[0];
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
      <span class="type-tag">${item.type}</span>
      <span class="mono" style="font-size:11px; color:#888;">${formatDate(item.published_at)}</span>
    </div>
    <h3 style="font-size:18px; font-weight:700; margin-bottom:8px;">${escapeHtml(item.title)}</h3>
    <p class="mono" style="font-size:13px; color:#ccc;">${escapeHtml(item.body)}</p>
  `;
}

// Scheduled Tab List
function renderScheduledList() {
  const container = document.getElementById('scheduledItemsList');
  const scheduled = allContent.filter(i => i.status === 'SCHEDULED');

  if (scheduled.length === 0) {
    container.innerHTML = `<div class="card mono" style="color:#888;">No scheduled items pending publication.</div>`;
    return;
  }

  container.innerHTML = scheduled.map(item => `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="type-tag">${item.type}</span>
          <h4 style="margin: 8px 0; font-size:16px;">${escapeHtml(item.title)}</h4>
          <p class="mono" style="font-size:12px; color:#aaa;">Scheduled For: ${formatDate(item.scheduled_at)}</p>
        </div>
        <button class="btn btn-primary btn-small" onclick="publishNow('${item.id}')">PUBLISH NOW</button>
      </div>
    </div>
  `).join('');
}

// Live Widget Preview Sync
function setupFormListeners() {
  const updatePreview = () => {
    prevTag.textContent = contentType.value;
    prevTitle.textContent = contentTitle.value.toUpperCase() || "TOMORROW'S CLASSES";
    prevBody.textContent = (contentShortText.value || contentBody.value || "WILL BE CONDUCTED ONLINE.").toUpperCase();
    prevId.textContent = `${contentType.value} #108`;
    prevTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }).toUpperCase();
  };

  [contentType, contentTitle, contentBody, contentShortText].forEach(el => {
    el.addEventListener('input', updatePreview);
  });

  // Toggle MCQ form fields visibility based on Type selection
  contentType.addEventListener('change', () => {
    const mcqGroup = document.getElementById('mcqFormGroup');
    if (contentType.value === 'GAME') {
      mcqGroup.classList.remove('hidden');
    } else {
      mcqGroup.classList.add('hidden');
    }
    updatePreview();
  });

  // Save / Publish submit handler
  contentForm.addEventListener('submit', (e) => handleFormSubmit(e, 'PUBLISHED'));
  document.getElementById('saveDraftBtn').addEventListener('click', (e) => handleFormSubmit(e, 'DRAFT'));
}

async function handleFormSubmit(e, targetStatus) {
  if (e) e.preventDefault();

  const editId = document.getElementById('editId').value;
  const typeVal = contentType.value;

  const payload = {
    type: typeVal,
    category: contentCategory.value,
    title: contentTitle.value,
    body: contentBody.value,
    short_text: contentShortText.value || contentBody.value,
    author: contentAuthor.value,
    priority: parseInt(contentPriority.value, 10) || 1,
    status: targetStatus || contentStatus.value,
    scheduled_at: scheduledAt.value ? new Date(scheduledAt.value).toISOString() : new Date().toISOString(),
    published_at: new Date().toISOString()
  };

  if (typeVal === 'GAME') {
    const optA = document.getElementById('mcqOptA').value || '8';
    const optB = document.getElementById('mcqOptB').value || '10';
    const optC = document.getElementById('mcqOptC').value || '12';
    const optD = document.getElementById('mcqOptD').value || '16';

    payload.question = document.getElementById('mcqQuestion').value || contentBody.value;
    payload.options = [optA, optB, optC, optD].join(', ');
    payload.correct_answer = document.getElementById('mcqCorrect').value || optB;
    payload.explanation = document.getElementById('mcqExplanation').value || 'Multiplication before addition.';
    payload.difficulty = 'EASY';
    payload.points = parseInt(document.getElementById('mcqPoints').value, 10) || 10;
  }

  const url = editId ? `${getApiUrl()}/admin/content/${editId}` : `${getApiUrl()}/admin/content`;
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert(`✓ Content ${editId ? 'updated' : 'published'} successfully!`);
      contentForm.reset();
      document.getElementById('editId').value = '';
      await loadDashboardData();
    } else {
      const err = await res.json();
      alert(`Error: ${err.error || 'Failed saving content'}`);
    }
  } catch (err) {
    alert('Failed connecting to backend server.');
  }
}

// Widget Size Preview Switcher
function setupWidgetPreviewSwitcher() {
  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const size = btn.getAttribute('data-size');
      widgetPreviewBox.className = `widget-container size-${size}`;
    });
  });
}

// Action Helpers
window.editItem = function(id) {
  const item = allContent.find(i => i.id === id);
  if (!item) return;

  document.getElementById('editId').value = item.id;
  contentType.value = item.type;
  contentCategory.value = item.category || 'Campus';
  contentTitle.value = item.title;
  contentBody.value = item.body;
  contentShortText.value = item.short_text || '';
  contentAuthor.value = item.author || '';
  contentPriority.value = item.priority !== undefined ? item.priority : 1;
  contentStatus.value = item.status;

  // Switch to Create/Edit Tab
  document.querySelector('.nav-item[data-tab="create"]').click();
};

window.deleteItem = async function(id) {
  if (!confirm('Are you sure you want to delete this content item?')) return;
  try {
    const res = await fetch(`${getApiUrl()}/admin/content/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      loadDashboardData();
    }
  } catch (err) {
    alert('Failed deleting item');
  }
};

window.publishNow = async function(id) {
  const item = allContent.find(i => i.id === id);
  if (!item) return;
  item.status = 'PUBLISHED';
  item.published_at = new Date().toISOString();

  try {
    await fetch(`${getApiUrl()}/admin/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(item)
    });
    loadDashboardData();
  } catch (err) {
    alert('Failed publishing item');
  }
};

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
