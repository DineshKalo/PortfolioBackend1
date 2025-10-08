const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Hero } = require('../models');
const authMiddleware = require('../middleware/auth');
const { translateToArabic } = require('../utils/translator');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for hero images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get hero section (public)
router.get('/', async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) {
      hero = await Hero.create({ 
        title: {
          en: 'Welcome to My Portfolio',
          ar: 'مرحبا بكم في محفظتي'
        },
        subtitle: {
          en: 'Creative Professional',
          ar: 'محترف مبدع'
        }
      });
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Update hero text (protected) - Auto-translates to Arabic
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { title, subtitle } = req.body; // Expects { en: "...", ar: "..." }
    let hero = await Hero.findOne();
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    
    if (!hero) {
      hero = await Hero.create(updates);
    } else {
      if (updates.title) hero.title = updates.title;
      if (updates.subtitle) hero.subtitle = updates.subtitle;
      hero.updatedAt = Date.now();
      await hero.save();
    }
    
    res.json({ message: 'Hero section updated', hero });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload hero background image (protected)
router.post('/background-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    let hero = await Hero.findOne();
    
    // Delete old image from Cloudinary if exists
    if (hero && hero.backgroundImageCloudinaryId) {
      await cloudinary.uploader.destroy(hero.backgroundImageCloudinaryId);
    }

    // Upload new image
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'portfolio_hero' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    if (!hero) {
      const defaultTitle = 'Welcome to My Portfolio';
      const defaultSubtitle = 'Creative Professional';
      hero = await Hero.create({
        title: {
          en: defaultTitle,
          ar: await translateToArabic(defaultTitle)
        },
        subtitle: {
          en: defaultSubtitle,
          ar: await translateToArabic(defaultSubtitle)
        },
        backgroundImageUrl: result.secure_url,
        backgroundImageCloudinaryId: result.public_id
      });
    } else {
      hero.backgroundImageUrl = result.secure_url;
      hero.backgroundImageCloudinaryId = result.public_id;
      hero.updatedAt = Date.now();
      await hero.save();
    }

    res.json({ message: 'Hero background image uploaded', hero });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete hero background image (protected)
router.delete('/background-image', authMiddleware, async (req, res) => {
  try {
    const hero = await Hero.findOne();
    
    if (!hero || !hero.backgroundImageCloudinaryId) {
      return res.status(404).json({ message: 'No background image found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(hero.backgroundImageCloudinaryId);
    
    // Remove from database
    hero.backgroundImageUrl = undefined;
    hero.backgroundImageCloudinaryId = undefined;
    hero.updatedAt = Date.now();
    await hero.save();
    
    res.json({ message: 'Hero background image deleted', hero });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;