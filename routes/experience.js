const express = require('express');
const router = express.Router();
const { Experience } = require('../models');
const authMiddleware = require('../middleware/auth');
const { translateToArabic } = require('../utils/translator');

// Get all experiences (public)
router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create experience (protected) - Auto-translates to Arabic
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, date, inProgress, order } = req.body;
    // name comes as { en: "...", ar: "..." }
    
    const experience = await Experience.create({
      name,
      date: inProgress ? null : date,
      inProgress,
      order: order || 0
    });
    
    res.status(201).json({ message: 'Experience created', experience });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update experience (protected) - Auto-translates to Arabic
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, date, inProgress, order } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (date !== undefined) updates.date = inProgress ? null : date;
    if (inProgress !== undefined) updates.inProgress = inProgress;
    if (order !== undefined) updates.order = order;
    
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json({ message: 'Experience updated', experience });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete experience (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;