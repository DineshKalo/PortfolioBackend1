const express = require('express');
const router = express.Router();
const { Journey } = require('../models');
const authMiddleware = require('../middleware/auth');
const { translateToArabic } =require('../utils/translator');

// Get all journey items (public)
router.get('/', async (req, res) => {
  try {
    const journey = await Journey.find().sort({ order: 1, createdAt: 1 });
    res.json(journey);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create journey item (protected) - Auto-translates to Arabic
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { age, title, body, order } = req.body;
    
    // Translate title and body to Arabic
    const titleAr = await translateToArabic(title);
    const bodyAr = await translateToArabic(body);
    
    const journey = await Journey.create({
      age,
      title: {
        en: title,
        ar: titleAr
      },
      body: {
        en: body,
        ar: bodyAr
      },
      order: order || 0
    });
    
    res.status(201).json({ message: 'Journey item created (English & Arabic)', journey });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update journey item (protected) - Auto-translates to Arabic
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { age, title, body, order } = req.body;
    
    const updates = {};
    if (age !== undefined) updates.age = age;
    if (order !== undefined) updates.order = order;
    
    if (title !== undefined) {
      updates.title = {
        en: title,
        ar: await translateToArabic(title)
      };
    }
    
    if (body !== undefined) {
      updates.body = {
        en: body,
        ar: await translateToArabic(body)
      };
    }
    
    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!journey) {
      return res.status(404).json({ message: 'Journey item not found' });
    }
    
    res.json({ message: 'Journey item updated (English & Arabic)', journey });
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