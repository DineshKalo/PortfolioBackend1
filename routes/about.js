const express = require('express');
const router = express.Router();
const { About } = require('../models');
const authMiddleware = require('../middleware/auth');

// Get about content (public)
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create({ content: 'Welcome to our portfolio!' });
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update about content (protected)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    let about = await About.findOne();
    
    if (!about) {
      about = await About.create({ content });
    } else {
      about.content = content;
      about.updatedAt = Date.now();
      await about.save();
    }
    
    res.json({ message: 'About section updated', about });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;