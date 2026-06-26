const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { redirectToOriginal } = require('./controllers/redirect.controller');
require('dotenv').config();


const urlRoutes = require('./routes/url.routes');
const redirectRoute = require('./routes/redirect.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/urls', urlRoutes);
app.get('/:code', redirectToOriginal); // short link redirect: GET /:code

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
