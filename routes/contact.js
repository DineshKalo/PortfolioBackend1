const express = require('express');
const router = express.Router();
const { Contact } = require('../models');
const authMiddleware = require('../middleware/auth');

// Get contact info (public)
router.get('/', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({ 
        email: '',
        name: '',
        instagramHandle: ''
      });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update contact info (protected)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { email, name, instagramHandle } = req.body;
    let contact = await Contact.findOne();
    
    if (!contact) {
      contact = await Contact.create({ email, name, instagramHandle });
    } else {
      contact.email = email;
      contact.name = name;
      contact.instagramHandle = instagramHandle;
      contact.updatedAt = Date.now();
      await contact.save();
    }
    
    res.json({ message: 'Contact info updated', contact });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;