const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { About } = require('../models');
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get about content (public)
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      const defaultContent = 'Welcome to our portfolio!';
      const arabicContent = await translateToArabic(defaultContent);
      about = await About.create({ 
        content: {
          en: defaultContent,
          ar: arabicContent
        }
      });
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update about content (protected) - Auto-translates to Arabic
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body; // Expects { en: "...", ar: "..." }
    
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

// Upload profile picture (protected)
router.post('/profile-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    let about = await About.findOne();
    
    // Delete old image from Cloudinary if exists
    if (about && about.profileImageCloudinaryId) {
      await cloudinary.uploader.destroy(about.profileImageCloudinaryId);
    }

    // Upload new image
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'portfolio_profile' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    if (!about) {
      const defaultContent = 'Welcome to our portfolio!';
      const arabicContent = await translateToArabic(defaultContent);
      about = await About.create({
        content: {
          en: defaultContent,
          ar: arabicContent
        },
        profileImageUrl: result.secure_url,
        profileImageCloudinaryId: result.public_id
      });
    } else {
      about.profileImageUrl = result.secure_url;
      about.profileImageCloudinaryId = result.public_id;
      about.updatedAt = Date.now();
      await about.save();
    }

    res.json({ message: 'Profile image uploaded', about });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete profile picture (protected)
router.delete('/profile-image', authMiddleware, async (req, res) => {
  try {
    const about = await About.findOne();
    
    if (!about || !about.profileImageCloudinaryId) {
      return res.status(404).json({ message: 'No profile image found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(about.profileImageCloudinaryId);
    
    // Remove from database
    about.profileImageUrl = undefined;
    about.profileImageCloudinaryId = undefined;
    about.updatedAt = Date.now();
    await about.save();
    
    res.json({ message: 'Profile image deleted', about });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;