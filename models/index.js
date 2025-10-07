const mongoose = require('mongoose');

// Admin User Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

// About Section Schema (with profile picture)
const aboutSchema = new mongoose.Schema({
  content: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  profileImageUrl: { type: String },
  profileImageCloudinaryId: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// Hero Section Schema (background image)
const heroSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  subtitle: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  backgroundImageUrl: { type: String },
  backgroundImageCloudinaryId: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// Experience & Certification Schema
const experienceSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  date: { type: String },
  inProgress: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Client Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  comment: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  activityPackage: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Gallery Image Schema
const gallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  caption: String,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Journey/Timeline Schema
const journeySchema = new mongoose.Schema({
  age: { type: String, required: true },
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  body: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Contact Info Schema
const contactSchema = new mongoose.Schema({
  email: String,
  name: String,
  instagramHandle: String,
  updatedAt: { type: Date, default: Date.now }
});

// Models
const Admin = mongoose.model('Admin', adminSchema);
const About = mongoose.model('About', aboutSchema);
const Hero = mongoose.model('Hero', heroSchema);
const Experience = mongoose.model('Experience', experienceSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Journey = mongoose.model('Journey', journeySchema);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
  Admin,
  About,
  Hero,
  Experience,
  Testimonial,
  Gallery,
  Journey,
  Contact
};