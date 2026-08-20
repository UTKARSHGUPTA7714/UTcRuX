const repository = require('../repositories');
const fcmService = require('../services/fcmService');

async function getLatestContent(req, res) {
  try {
    const latest = await repository.getLatest();
    if (!latest) {
      return res.status(404).json({
        id: "crux_empty",
        type: "CRUX",
        title: "WELCOME TO CRUX",
        body: "No new announcements available.",
        short_text: "Welcome to CRUX",
        publishedAt: new Date().toISOString()
      });
    }
    // Compact API payload for widget
    res.json({
      id: latest.id,
      type: latest.type,
      title: latest.title,
      body: latest.body,
      short_text: latest.short_text || latest.body,
      author: latest.author || 'CRUX',
      category: latest.category || 'General',
      visibility: latest.visibility || 'PUBLIC',
      published_at: latest.published_at,
      publishedAt: latest.published_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed fetching latest content' });
  }
}

async function getContentFeed(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const feed = await repository.getFeed(limit);
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: 'Failed fetching feed' });
  }
}

async function getContentById(req, res) {
  try {
    const item = await repository.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Content item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed fetching content item' });
  }
}

async function getContentByCategory(req, res) {
  try {
    const items = await repository.getByCategory(req.params.category);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed fetching category content' });
  }
}

async function getAllAdminContent(req, res) {
  try {
    const items = await repository.getAllForAdmin();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed fetching admin content' });
  }
}

async function createContent(req, res) {
  try {
    const { title, body, type, question, options, correct_answer } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    if (type === 'GAME') {
      if (!question || !options || !correct_answer) {
        return res.status(400).json({ error: 'GAME content requires question, options, and correct_answer' });
      }
      const optsList = (typeof options === 'string' ? options.split(',') : options).map(o => o.trim());
      if (!optsList.includes(correct_answer.trim())) {
        return res.status(400).json({ error: 'correct_answer must match one of the options' });
      }
    }
    const saved = await repository.save(req.body);

    // Dispatch lightweight FCM push signal (Fail-safe: Database record remains published if FCM fails)
    try {
      await fcmService.sendPushSignal(saved.id, 'CRUX_UPDATED');
    } catch (fcmErr) {
      console.warn('⚠️ Non-blocking FCM push signal error:', fcmErr.message || fcmErr);
    }

    res.status(201).json({ message: 'Content created successfully', data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed saving content' });
  }
}

async function updateContent(req, res) {
  try {
    const contentData = { ...req.body, id: req.params.id };
    const saved = await repository.save(contentData);
    res.json({ message: 'Content updated successfully', data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed updating content' });
  }
}

async function deleteContent(req, res) {
  try {
    const success = await repository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Content item not found' });
    }
    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed deleting content' });
  }
}

module.exports = {
  getLatestContent,
  getContentFeed,
  getContentById,
  getContentByCategory,
  getAllAdminContent,
  createContent,
  updateContent,
  deleteContent
};
