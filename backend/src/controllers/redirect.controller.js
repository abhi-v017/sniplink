const { db } = require('../config/firebase');
const admin = require('firebase-admin');

const URLS_COLLECTION = 'urls';

const redirectToOriginal = async (req, res) => {
  try {
    const { code } = req.params;

    // Skip API routes
    if (code.startsWith('api') || code === 'health') return res.status(404).json({ error: 'Not found' });

    const doc = await db.collection(URLS_COLLECTION).doc(code).get();
    if (!doc.exists) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>🔗 Link not found</h2>
          <p>This short link doesn't exist or has been deleted.</p>
        </body></html>
      `);
    }

    const data = doc.data();

    // Track click asynchronously (don't wait for it)
    const clickEntry = {
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || 'direct',
    };

    db.collection(URLS_COLLECTION).doc(code).update({
      clicks: admin.firestore.FieldValue.increment(1),
      clickDetails: admin.firestore.FieldValue.arrayUnion(clickEntry),
      updatedAt: new Date().toISOString(),
    }).catch(err => console.error('Click tracking error:', err));

    return res.redirect(301, data.originalUrl);
  } catch (err) {
    console.error('redirect error:', err);
    return res.status(500).send('Server error');
  }
};

module.exports = { redirectToOriginal };
