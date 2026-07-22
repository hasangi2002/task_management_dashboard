const rateLimit = require('express-rate-limit');

// General API rate limit — applies to most routes.
// 200 requests per 15 minutes per IP is generous for normal dashboard use,
// but blocks abusive traffic spikes.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth routes (login/register) — these are the most
// sensitive to brute-force attacks, so we allow far fewer attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login/register attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };