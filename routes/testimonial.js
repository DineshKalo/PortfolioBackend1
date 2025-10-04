const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const authMiddleware = require('../middleware/auth');

// Get all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create testimonial (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, comment, activityPackage, order } = req.body;
    const testimonial = await Testimonial.create({
      name,
      comment,
      activityPackage,
      order: order || 0
    });
    res.status(201).json({ message: 'Testimonial created', testimonial });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update testimonial (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, comment, activityPackage, order } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, comment, activityPackage, order },
      { new: true }
    );
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial updated', testimonial });
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