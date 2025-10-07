const translate = require('google-translate-api-x');

/**
 * Translate text from English to Arabic
 * @param {string} text - Text to translate
 * @returns {Promise<string>} - Translated text
 */
async function translateToArabic(text) {
  try {
    if (!text || text.trim() === '') {
      return '';
    }
    
    // Try to translate
    const result = await translate(text, { from: 'en', to: 'ar' });
    return result.text;
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Translate multiple fields of an object
 * @param {object} obj - Object with text fields
 * @param {array} fields - Array of field names to translate
 * @returns {Promise<object>} - Object with translated fields
 */
async function translateFields(obj, fields) {
  const translations = {};
  
  for (const field of fields) {
    if (obj[field]) {
      try {
        translations[field] = await translateToArabic(obj[field]);
      } catch (error) {
        console.error(`Failed to translate field ${field}:`, error.message);
        translations[field] = obj[field]; // Use original if translation fails
      }
    }
  }
  
  return translations;
}

/**
 * Create bilingual object with English and Arabic
 * @param {object} data - Original data object
 * @param {array} fieldsToTranslate - Fields to translate
 * @returns {Promise<object>} - Object with en and ar properties
 */
async function createBilingualData(data, fieldsToTranslate) {
  const arabicTranslations = await translateFields(data, fieldsToTranslate);
  
  const bilingual = {
    en: {},
    ar: {}
  };
  
  // Copy all fields to English version
  for (const key in data) {
    bilingual.en[key] = data[key];
  }
  
  // Copy translated fields to Arabic version
  for (const key in data) {
    if (fieldsToTranslate.includes(key)) {
      bilingual.ar[key] = arabicTranslations[key];
    } else {
      bilingual.ar[key] = data[key]; // Non-text fields remain same
    }
  }
  
  return bilingual;
}

module.exports = {
  translateToArabic,
  translateFields,
  createBilingualData
};