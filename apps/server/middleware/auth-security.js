import crypto from 'crypto';

// Security headers specifically for auth endpoints
export const authSecurityHeaders = (req, res, next) => {
  // Prevent caching of auth responses
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  // At least 6 characters
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  // In production, add more requirements:
  // - At least one uppercase letter
  // - At least one lowercase letter  
  // - At least one number
  // - At least one special character
  
  return { valid: true };
};

// Sanitize user input
export const sanitizeAuthInput = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }
  if (req.body.name) {
    req.body.name = req.body.name.trim();
  }
  next();
};

// Rate limiting for auth endpoints (stricter)
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Brute force protection
const loginAttempts = new Map();

export const bruteForceProtection = (req, res, next) => {
  const email = req.body.email;
  if (!email) return next();

  const key = `${email}:${req.ip}`;
  const attempts = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };

  // Reset after 1 hour
  if (Date.now() - attempts.firstAttempt > 60 * 60 * 1000) {
    attempts.count = 0;
    attempts.firstAttempt = Date.now();
  }

  // Block after 5 failed attempts
  if (attempts.count >= 5) {
    return res.status(429).json({ 
      error: 'Account temporarily locked due to multiple failed login attempts. Please try again in 1 hour.' 
    });
  }

  // Store attempt info in request for use in auth handler
  req.loginAttempt = { key, attempts };
  next();
};

// Update login attempts after auth
export const updateLoginAttempts = (key, success) => {
  if (success) {
    loginAttempts.delete(key);
  } else {
    const attempts = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
    attempts.count++;
    loginAttempts.set(key, attempts);
  }
};

// Session security
export const sessionSecurity = {
  // Generate secure session token
  generateSecureToken: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  // Hash sensitive data before storing
  hashSensitiveData: (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  // Validate session token format
  validateTokenFormat: (token) => {
    // Must be 64 hex characters (32 bytes)
    return /^[a-f0-9]{64}$/i.test(token);
  }
};

// Input validation schemas
export const authSchemas = {
  signup: {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 },
    name: { required: false, type: 'string', maxLength: 100 }
  },
  signin: {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string' }
  }
};

// SQL injection prevention (parameterized queries are already used, but extra validation)
export const preventSQLInjection = (req, res, next) => {
  const dangerous = /[';\\]/;
  
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string' && dangerous.test(value)) {
      return res.status(400).json({ error: 'Invalid characters in input' });
    }
  }
  
  next();
};

// GDPR compliance helpers
export const gdprCompliance = {
  // Anonymize user data
  anonymizeUser: (userData) => {
    return {
      ...userData,
      email: 'deleted@user.com',
      name: 'Deleted User',
      password_hash: null
    };
  },

  // Get user data for export
  exportUserData: (user, events, agents) => {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        last_login: user.last_login
      },
      events: events.map(e => ({
        timestamp: e.timestamp,
        event_type: e.event_type,
        summary: e.summary
      })),
      agents: agents,
      exported_at: new Date().toISOString()
    };
  }
};

// Security audit logging
export const auditLog = (action, userId, details) => {
  console.log(`[AUDIT] ${new Date().toISOString()} - Action: ${action}, User: ${userId}, Details: ${JSON.stringify(details)}`);
  // In production, write to secure audit log file or service
};

export default {
  authSecurityHeaders,
  validateEmail,
  validatePasswordStrength,
  sanitizeAuthInput,
  authRateLimiter,
  bruteForceProtection,
  updateLoginAttempts,
  sessionSecurity,
  preventSQLInjection,
  gdprCompliance,
  auditLog
};