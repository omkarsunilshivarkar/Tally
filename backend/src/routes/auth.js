import crypto from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dev-key';

// Google certificate caching for token verification
let googleCertsCache = null;
let googleCertsExpiration = 0;

async function getGoogleCerts() {
  const now = Date.now();
  if (googleCertsCache && now < googleCertsExpiration) {
    return googleCertsCache;
  }
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v1/certs');
    if (!res.ok) {
      throw new Error('Failed to fetch Google public certificates');
    }
    const certs = await res.json();
    googleCertsCache = certs;
    googleCertsExpiration = now + 6 * 60 * 60 * 1000; // Cache for 6 hours
    return certs;
  } catch (error) {
    console.error('Error fetching Google certs:', error);
    if (googleCertsCache) return googleCertsCache;
    throw error;
  }
}

async function verifyGoogleIdToken(idToken) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured on the server');
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Invalid token structure');
  }

  const certs = await getGoogleCerts();
  const cert = certs[decoded.header.kid];
  if (!cert) {
    throw new Error('Google certificate key ID not found');
  }

  return jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    audience: googleClientId,
    issuer: ['accounts.google.com', 'https://accounts.google.com'],
  });
}

// Hash password using native scrypt
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

// Compare password against a hash (supporting new scrypt and legacy bcryptjs)
async function verifyPassword(password, hash) {
  if (hash.startsWith('scrypt$')) {
    const parts = hash.split('$');
    const salt = parts[1];
    const key = parts[2];
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
      });
    });
  }
  // Fallback to legacy bcryptjs
  return bcrypt.compare(password, hash);
}

// Helper to generate UUIDs locally
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = generateUUID();

    // Insert user
    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
    });

    // Generate JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (foundUsers.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = foundUsers[0];

    // Compare passwords
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Auto-upgrade legacy bcrypt hash to scrypt
    if (!user.passwordHash.startsWith('scrypt$')) {
      try {
        const newHash = await hashPassword(password);
        await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
      } catch (err) {
        console.error('Failed to upgrade password hash:', err);
      }
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * POST /api/auth/google
 */
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential (ID Token) is required' });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return res.status(500).json({ error: 'Google Client ID is not configured on the server.' });
  }

  try {
    const payload = await verifyGoogleIdToken(credential);
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Google account does not provide an email address' });
    }

    // Find if user exists by email
    let foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    let user;

    if (foundUsers.length === 0) {
      // Register new user with random password hash
      const userId = generateUUID();
      const randomPassword = crypto.randomUUID();
      const passwordHash = await hashPassword(randomPassword);

      await db.insert(users).values({
        id: userId,
        email: email.toLowerCase(),
        name: name || 'Google User',
        passwordHash,
      });

      user = { id: userId, email: email.toLowerCase(), name: name || 'Google User' };
    } else {
      user = foundUsers[0];
    }

    // Generate our app's JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(400).json({ error: 'Failed to authenticate Google user: ' + error.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const foundUsers = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (foundUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = foundUsers[0];
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
