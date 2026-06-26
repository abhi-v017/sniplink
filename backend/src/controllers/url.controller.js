const { db } = require('../config/firebase');
const { nanoid } = require('nanoid');

const URLS_COLLECTION = 'urls';

// Validate URL
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// POST /api/urls - create short URL
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required' });
    if (!isValidUrl(originalUrl)) return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });

    let shortCode = customCode ? customCode.trim() : nanoid(7);

    // Validate custom code
    if (customCode) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(shortCode)) {
        return res.status(400).json({ error: 'Custom code must be 3–20 characters: letters, numbers, - or _' });
      }
      // Check if already taken
      const existing = await db.collection(URLS_COLLECTION).doc(shortCode).get();
      if (existing.exists) {
        return res.status(409).json({ error: 'This custom code is already taken. Try another.' });
      }
    }

    const now = new Date().toISOString();
    const urlData = {
      shortCode,
      originalUrl,
      userId,
      userEmail,
      clicks: 0,
      clickDetails: [], // array of { timestamp, userAgent, referer }
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(URLS_COLLECTION).doc(shortCode).set(urlData);

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return res.status(201).json({
      ...urlData,
      shortUrl: `${baseUrl}/${shortCode}`,
    });
  } catch (err) {
    console.error('createShortUrl error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/urls - get all URLs for logged-in user
const getUserUrls = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db
      .collection(URLS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const urls = snapshot.docs.map(doc => ({
      ...doc.data(),
      shortUrl: `${baseUrl}/${doc.id}`,
    }));

    return res.json({ urls });
  } catch (err) {
    console.error('getUserUrls error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/urls/:code/analytics - click analytics for a URL
const getAnalytics = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.uid;

    const doc = await db.collection(URLS_COLLECTION).doc(code).get();
    if (!doc.exists) return res.status(404).json({ error: 'Short URL not found' });

    const data = doc.data();
    if (data.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    // Aggregate clicks by day
    const clicksByDay = {};
    (data.clickDetails || []).forEach(click => {
      const day = click.timestamp.split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    });

    return res.json({
      shortCode: code,
      shortUrl: `${baseUrl}/${code}`,
      originalUrl: data.originalUrl,
      totalClicks: data.clicks,
      createdAt: data.createdAt,
      clicksByDay,
      recentClicks: (data.clickDetails || []).slice(-20).reverse(),
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/urls/:code
const deleteUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.uid;

    const doc = await db.collection(URLS_COLLECTION).doc(code).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    if (doc.data().userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await db.collection(URLS_COLLECTION).doc(code).delete();
    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('deleteUrl error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createShortUrl, getUserUrls, getAnalytics, deleteUrl };
