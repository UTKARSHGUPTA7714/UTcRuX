const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/latest', contentController.getLatestContent);
router.get('/feed', contentController.getContentFeed);
router.get('/category/:category', contentController.getContentByCategory);
router.get('/:id', contentController.getContentById);

module.exports = router;
