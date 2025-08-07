const jwt = require('jsonwebtoken');
const { dbUtils } = require('./database');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Allow unauthenticated access for now (backwards compatibility)
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists and is not expired
    const session = await dbUtils.get(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")',
      [token]
    );

    if (!session) {
      throw new Error('Session expired');
    }

    // Get user
    const user = await dbUtils.get(
      'SELECT id, email, name FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Require auth middleware (strict version)
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists and is not expired
    const session = await dbUtils.get(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")',
      [token]
    );

    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Get user
    const user = await dbUtils.get(
      'SELECT id, email, name FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Auth routes
const authRoutes = (app) => {
  // Sign up
  app.post('/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Check if user exists
      const existingUser = await dbUtils.get(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password and create user
      const passwordHash = await dbUtils.hashPassword(password);
      const result = await dbUtils.run(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, passwordHash, name || email.split('@')[0]]
      );

      const userId = result.id;

      // Create session
      const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await dbUtils.run(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt.toISOString()]
      );

      // Create default preferences
      await dbUtils.run(
        'INSERT INTO user_preferences (user_id, notification_settings, dashboard_settings) VALUES (?, ?, ?)',
        [userId, '{}', '{}']
      );

      res.json({
        token,
        user: {
          id: userId,
          email,
          name: name || email.split('@')[0]
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  // Sign in
  app.post('/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Get user
      const user = await dbUtils.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValid = await dbUtils.comparePassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await dbUtils.run(
        'UPDATE users SET last_login = datetime("now") WHERE id = ?',
        [user.id]
      );

      // Create session
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await dbUtils.run(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt.toISOString()]
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Failed to sign in' });
    }
  });

  // Sign out
  app.post('/auth/signout', authMiddleware, async (req, res) => {
    try {
      if (req.token) {
        // Delete session
        await dbUtils.run(
          'DELETE FROM sessions WHERE token = ?',
          [req.token]
        );
      }
      res.json({ message: 'Signed out successfully' });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ error: 'Failed to sign out' });
    }
  });

  // Get current user
  app.get('/auth/me', requireAuth, async (req, res) => {
    res.json({ user: req.user });
  });

  // Clean up expired sessions (run periodically)
  setInterval(async () => {
    try {
      const result = await dbUtils.run(
        'DELETE FROM sessions WHERE expires_at < datetime("now")'
      );
      if (result.changes > 0) {
        console.log(`Cleaned up ${result.changes} expired sessions`);
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
};

module.exports = { authMiddleware, requireAuth, authRoutes };