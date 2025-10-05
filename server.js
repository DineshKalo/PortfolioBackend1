require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const aboutRoutes = require('./routes/about');
const heroRoutes = require('./routes/hero');
const experienceRoutes = require('./routes/experience');
const testimonialRoutes = require('./routes/testimonial');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static('public'));

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✓ MongoDB Connected Successfully');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('✗ MongoDB Connection Error:', err.message);
  console.error('Please check your MONGODB_URI in .env file');
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/testimonial', testimonialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);

// Serve admin panel for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}`);
});