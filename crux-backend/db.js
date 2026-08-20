const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'content_store.json');
const SAMPLE_FILE = path.join(__dirname, 'sample_data.json');

// Initialize store if not exists
function initStore() {
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(SAMPLE_FILE)) {
      const sample = fs.readFileSync(SAMPLE_FILE, 'utf8');
      fs.writeFileSync(DATA_FILE, sample, 'utf8');
    } else {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
  }
}

function getAllContent() {
  initStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading db store:', err);
    return [];
  }
}

function saveAllContent(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

// Data access operations matching DynamoDB semantics
module.exports = {
  // Public Feed: published and not expired, ordered by priority & published_at desc
  getFeed: async (limit = 20) => {
    const items = getAllContent();
    const now = new Date().toISOString();
    
    const published = items.filter(item => {
      if (item.status !== 'PUBLISHED') return false;
      if (item.expires_at && item.expires_at < now) return false;
      if (item.published_at && item.published_at > now) return false;
      return true;
    });

    // Sort by priority (ascending 0, 1, 2...), then published_at descending
    published.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (a.priority || 99) - (b.priority || 99);
      }
      return new Date(b.published_at) - new Date(a.published_at);
    });

    return published.slice(0, limit);
  },

  getLatest: async () => {
    const feed = await module.exports.getFeed(1);
    return feed.length > 0 ? feed[0] : null;
  },

  getContentById: async (id) => {
    const items = getAllContent();
    return items.find(item => item.id === id) || null;
  },

  getByCategory: async (category) => {
    const feed = await module.exports.getFeed(100);
    return feed.filter(item => item.category.toLowerCase() === category.toLowerCase());
  },

  // Admin CRUD operations
  getAllForAdmin: async () => {
    return getAllContent();
  },

  saveContent: async (contentItem) => {
    const items = getAllContent();
    const existingIndex = items.findIndex(i => i.id === contentItem.id);
    const now = new Date().toISOString();
    
    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        ...contentItem,
        updated_at: now
      };
    } else {
      const newItem = {
        id: contentItem.id || `crux_${Date.now()}`,
        type: contentItem.type || 'CRUX',
        title: contentItem.title || 'Untitled',
        body: contentItem.body || '',
        short_text: contentItem.short_text || contentItem.body || '',
        author: contentItem.author || 'CRUX Admin',
        category: contentItem.category || 'General',
        image_url: contentItem.image_url || '',
        status: contentItem.status || 'PUBLISHED',
        priority: contentItem.priority !== undefined ? Number(contentItem.priority) : 5,
        published_at: contentItem.published_at || now,
        scheduled_at: contentItem.scheduled_at || now,
        created_at: now,
        updated_at: now,
        expires_at: contentItem.expires_at || ''
      };
      items.unshift(newItem);
    }

    saveAllContent(items);
    return contentItem.id ? items.find(i => i.id === contentItem.id) : items[0];
  },

  deleteContent: async (id) => {
    let items = getAllContent();
    const initialLen = items.length;
    items = items.filter(i => i.id !== id);
    if (items.length !== initialLen) {
      saveAllContent(items);
      return true;
    }
    return false;
  }
};
