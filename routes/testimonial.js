const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const authMiddleware = require('../middleware/auth');
const { translateToArabic } = require('../utils/translator');

// Get all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create testimonial (protected) - Auto-translates to Arabic
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, comment, activityPackage, order } = req.body;
    
    // Translate comment and activity package to Arabic
    const commentAr = await translateToArabic(comment);
    const activityPackageAr = activityPackage ? await translateToArabic(activityPackage) : '';
    
    const testimonial = await Testimonial.create({
      name,
      comment: {
        en: comment,
        ar: commentAr
      },
      activityPackage: activityPackage ? {
        en: activityPackage,
        ar: activityPackageAr
      } : undefined,
      order: order || 0
    });
    
    res.status(201).json({ message: 'Testimonial created (English & Arabic)', testimonial });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update testimonial (protected) - Auto-translates to Arabic
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, comment, activityPackage, order } = req.body;
    
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (order !== undefined) updates.order = order;
    
    if (comment !== undefined) {
      updates.comment = {
        en: comment,
        ar: await translateToArabic(comment)
      };
    }
    
    if (activityPackage !== undefined) {
      updates.activityPackage = activityPackage ? {
        en: activityPackage,
        ar: await translateToArabic(activityPackage)
      } : undefined;
    }
    
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial updated (English & Arabic)', testimonial });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete testimonial (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;