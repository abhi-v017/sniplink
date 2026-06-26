const express = require('express');
const router = express.Router();
const { redirectToOriginal } = require('../controllers/redirect.controller');

router.get('/:code', redirectToOriginal);

module.exports = router;
