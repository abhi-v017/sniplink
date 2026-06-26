const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
  createShortUrl,
  getUserUrls,
  getAnalytics,
  deleteUrl,
} = require('../controllers/url.controller');

router.use(verifyToken); // all URL routes require auth

router.post('/', createShortUrl);
router.get('/', getUserUrls);
router.get('/:code/analytics', getAnalytics);
router.delete('/:code', deleteUrl);

module.exports = router;
