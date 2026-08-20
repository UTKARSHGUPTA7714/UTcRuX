const fs = require('fs');
const path = require('path');
const ContentRepositoryInterface = require('./contentRepositoryInterface');

const DATA_FILE = path.join(__dirname, '../../content_store.json');
const SAMPLE_FILE = path.join(__dirname, '../../sample_data.json');

class LocalContentRepository extends ContentRepositoryInterface {
  constructor() {
    super();
    this._initStore();
  }

  _initStore() {
    if (!fs.existsSync(DATA_FILE)) {
      if (fs.existsSync(SAMPLE_FILE)) {
        const sample = fs.readFileSync(SAMPLE_FILE, 'utf8');
        fs.writeFileSync(DATA_FILE, sample, 'utf8');
      } else {
        fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      }
    }
  }

  _readAll() {
    this._initStore();
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed reading local content store:', err);
      return [];
    }
  }

  _writeAll(items) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  }

  // Server-side publishing rule evaluation engine
  _filterPublished(items) {
    const nowTime = Date.now() + 1000;
    return items.filter(item => {
      // 1. Must be PUBLISHED status set by server
      if (item.status !== 'PUBLISHED') return false;
      // 2. Must be PUBLIC visibility
      if (item.visibility && item.visibility !== 'PUBLIC') return false;
      // 3. Must not be expired
      if (item.expires_at && new Date(item.expires_at).getTime() < Date.now()) return false;
      // 4. Must be at or before current time
      if (item.published_at && new Date(item.published_at).getTime() > nowTime) return false;
      return true;
    });
  }

  async getFeed(limit = 20) {
    const items = this._readAll();
    const published = this._filterPublished(items);

    published.sort((a, b) => {
      return new Date(b.published_at) - new Date(a.published_at);
    });

    return published.slice(0, limit);
  }

  async getLatest() {
    const feed = await this.getFeed(1);
    return feed.length > 0 ? feed[0] : null;
  }

  async getById(id) {
    const items = this._readAll();
    return items.find(i => i.id === id) || null;
  }

  async getByCategory(category) {
    const feed = await this.getFeed(100);
    return feed.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
  }

  async getAllForAdmin() {
    return this._readAll();
  }

  async save(contentItem) {
    const items = this._readAll();
    const now = new Date().toISOString();
    const existingIndex = items.findIndex(i => i.id === contentItem.id);

    if (existingIndex >= 0) {
      const updated = {
        ...items[existingIndex],
        ...contentItem,
        updated_at: now
      };
      items[existingIndex] = updated;
      this._writeAll(items);
      return updated;
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
        visibility: contentItem.visibility || 'PUBLIC',
        status: contentItem.status || 'PUBLISHED',
        priority: contentItem.priority !== undefined ? Number(contentItem.priority) : 5,
        published_at: contentItem.published_at || now,
        scheduled_at: contentItem.scheduled_at || now,
        created_at: now,
        updated_at: now,
        expires_at: contentItem.expires_at || ''
      };
      items.unshift(newItem);
      this._writeAll(items);
      return newItem;
    }
  }

  async delete(id) {
    let items = this._readAll();
    const lenBefore = items.length;
    items = items.filter(i => i.id !== id);
    if (items.length !== lenBefore) {
      this._writeAll(items);
      return true;
    }
    return false;
  }
}

module.exports = LocalContentRepository;
