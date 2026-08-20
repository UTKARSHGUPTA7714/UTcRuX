const express = require('express');
const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Unauthenticated Admin Login
router.post('/login', authController.loginAdmin);

// Protected Admin Content Operations
router.get('/content', verifyAdminToken, contentController.getAllAdminContent);
router.post('/content', verifyAdminToken, contentController.createContent);
router.put('/content/:id', verifyAdminToken, contentController.updateContent);
router.delete('/content/:id', verifyAdminToken, contentController.deleteContent);

module.exports = router;
