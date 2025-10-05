const express = require('express');
const router = express.Router();
const { Journey } = require('../models');
const authMiddleware = require('../middleware/auth');

// Get all journey items (public)
router.get('/', async (req, res) => {
  try {
    const journey = await Journey.find().sort({ order: 1, createdAt: 1 });
    res.json(journey);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create journey item (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { age, title, body, order } = req.body;
    const journey = await Journey.create({
      age,
      title,
      body,
      order: order || 0
    });
    res.status(201).json({ message: 'Journey item created', journey });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update journey item (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { age, title, body, order } = req.body;
    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      { age, title, body, order },
      { new: true }
    );
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey item not found' });
    }
    
    res.json({ message: 'Journey item updated', journey });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete journey item (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const journey = await Journey.findByIdAndDelete(req.params.id);
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey item not found' });
    }
    
    res.json({ message: 'Journey item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;