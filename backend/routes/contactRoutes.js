// backend/routes/contact.routes.js
const express = require('express');
const contactController = require('../controllers/contact.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route - anyone can submit contact (no auth required)
router.post('/submit', contactController.submitContact);

// Admin only routes (require authentication and admin role)
router.get('/admin/contacts', authenticate, authorize(['admin']), contactController.getAllContacts);
router.get('/admin/contacts/stats', authenticate, authorize(['admin']), contactController.getContactStats);
router.get('/admin/contacts/:id', authenticate, authorize(['admin']), contactController.getContactById);
router.patch('/admin/contacts/:id/status', authenticate, authorize(['admin']), contactController.updateContactStatus);
router.delete('/admin/contacts/:id', authenticate, authorize(['admin']), contactController.deleteContact);

module.exports = router;